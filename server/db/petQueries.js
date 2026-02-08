// server/db/petQueries.js
// Pet-related database queries - modular, atomic, and ACID compliant
const db = require('./index');

/**
 * Get specific pet information - enhanced version
 */
async function getPetById(petid) {
  const query = `
    SELECT p.id, p.userid, p.s_petname, p.s_type, p.s_breed, p.s_description, 
           p.s_color, p.s_age, p.s_gender, p.s_size, p.b_vaccinated, p.b_sterilized,
           p.dt_created_at, u.s_username, u.s_full_name, u.s_full_surname,
           u.s_phone_prefix, u.s_phone_number, u.s_city,
           uimg.image_id as owner_avatar
    FROM pets p
    JOIN users u ON p.userid = u.id
    LEFT JOIN user_images uimg ON u.id = uimg.userid AND uimg.b_active = 1
    WHERE p.id = ? AND p.b_active = 1 AND u.b_active = 1
  `;

  const results = await db.executeWithNoLock(query, [petid]);
  return results[0] || null;
}

/**
 * Get pet images
 */
async function getPetImages(petid) {
  const query = 'SELECT image_id FROM pets_images WHERE petid = ? AND b_active = 1 ORDER BY dt_created_at DESC';
  return await db.executeWithNoLock(query, [petid]);
}

/**
 * Create new pet (atomic) - enhanced version
 */
async function createPet(userid, petData) {
  const {
    s_petname, s_type, s_breed, s_description,
    s_color, s_age, s_gender, s_size,
    b_vaccinated, b_sterilized
  } = petData;

  const query = `
    INSERT INTO pets (
      userid, s_petname, s_type, s_breed, s_description, 
      s_color, s_age, s_gender, s_size, 
      b_vaccinated, b_sterilized, b_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;

  const results = await db.executeTransaction([{
    query,
    params: [
      userid, s_petname, s_type, s_breed, s_description || null,
      s_color, s_age || null, s_gender, s_size,
      b_vaccinated ? 1 : 0, b_sterilized ? 1 : 0
    ]
  }]);

  return results[0].insertId;
}

/**
 * Update pet information (atomic) - enhanced version
 */
async function updatePet(petid, petData) {
  const {
    s_petname, s_type, s_breed, s_description,
    s_color, s_age, s_gender, s_size,
    b_vaccinated, b_sterilized
  } = petData;

  const query = `
    UPDATE pets 
    SET s_petname = COALESCE(?, s_petname),
        s_type = COALESCE(?, s_type),
        s_breed = COALESCE(?, s_breed),
        s_description = COALESCE(?, s_description),
        s_color = COALESCE(?, s_color),
        s_age = COALESCE(?, s_age),
        s_gender = COALESCE(?, s_gender),
        s_size = COALESCE(?, s_size),
        b_vaccinated = COALESCE(?, b_vaccinated),
        b_sterilized = COALESCE(?, b_sterilized)
    WHERE id = ?
  `;

  return await db.executeTransaction([{
    query,
    params: [
      s_petname !== undefined ? s_petname : null,
      s_type !== undefined ? s_type : null,
      s_breed !== undefined ? s_breed : null,
      s_description !== undefined ? s_description : null,
      s_color !== undefined ? s_color : null,
      s_age !== undefined ? s_age : null,
      s_gender !== undefined ? s_gender : null,
      s_size !== undefined ? s_size : null,
      b_vaccinated !== undefined ? (b_vaccinated ? 1 : 0) : null,
      b_sterilized !== undefined ? (b_sterilized ? 1 : 0) : null,
      petid
    ]
  }]);
}

/**
 * Add pet image
 */
async function addPetImage(petid, imageId) {
  const query = 'INSERT INTO pets_images (petid, image_id, b_active) VALUES (?, ?, 1)';
  return await db.executeTransaction([{
    query,
    params: [petid, imageId]
  }]);
}

/**
 * Delete pet (soft delete, atomic)
 */
async function deletePet(petid) {
  const operations = [
    {
      query: 'UPDATE pets SET b_active = 0 WHERE id = ?',
      params: [petid]
    },
    {
      query: 'UPDATE pets_images SET b_active = 0 WHERE petid = ?',
      params: [petid]
    }
  ];

  return await db.executeTransaction(operations);
}

/**
 * Check if pet exists and get owner
 */
async function getPetOwnership(petid) {
  const query = 'SELECT userid FROM pets WHERE id = ? AND b_active = 1';
  const results = await db.executeWithNoLock(query, [petid]);
  return results[0] || null;
}

async function getBreedsByType(petType) {
  const query = `
    SELECT pb.id, pb.s_breed, pt.s_type
    FROM pets_breed pb
    JOIN pets_types pt ON pb.id_type = pt.id
    WHERE pt.s_type = ? AND pb.b_active = 1 AND pt.b_active = 1
    ORDER BY pb.s_breed ASC
  `;

  return await db.executeWithNoLock(query, [petType]);
}

/**
 * Get all pet types
 */
async function getAllPetTypes() {
  const query = `
    SELECT id, s_type
    FROM pets_types 
    WHERE b_active = 1
    ORDER BY s_type ASC
  `;

  return await db.executeWithNoLock(query);
}

/**
 * Get all pet genders
 */
async function getAllGenders() {
  const query = `
    SELECT id, s_gender
    FROM pets_gender 
    WHERE b_active = 1
    ORDER BY s_gender ASC
  `;

  return await db.executeWithNoLock(query);
}

/**
 * Get all pet sizes
 */
async function getAllSizes() {
  const query = `
    SELECT id, s_size, s_size_code
    FROM pets_size 
    WHERE b_active = 1
    ORDER BY s_size ASC
  `;

  return await db.executeWithNoLock(query);
}

/**
 * Get all pet colors
 */
async function getAllColors() {
  const query = `
    SELECT id, s_color, s_hex
    FROM pets_color 
    WHERE b_active = 1
    ORDER BY s_color ASC
  `;

  return await db.executeWithNoLock(query);
}

/**
 * Get all breeds with their types
 */
async function getAllBreeds() {
  const query = `
    SELECT pb.id, pb.s_breed, pt.s_type
    FROM pets_breed pb
    JOIN pets_types pt ON pb.id_type = pt.id
    WHERE pb.b_active = 1 AND pt.b_active = 1
    ORDER BY pt.s_type, pb.s_breed ASC
  `;

  return await db.executeWithNoLock(query);
}

module.exports = {
  getPetById,
  getPetImages,
  createPet,
  updatePet,
  deletePet,
  addPetImage,
  getPetOwnership,
  getAllBreeds,
  getBreedsByType,
  getAllPetTypes,
  getAllGenders,
  getAllSizes,
  getAllColors,
};


