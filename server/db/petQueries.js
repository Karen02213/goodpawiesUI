// server/db/petQueries.js
// Pet-related database queries - modular, atomic, and ACID compliant
const db = require('./index');

/**
 * Get specific pet information
 */
async function getPetById(petid) {
  const query = `
    SELECT p.id, p.userid, p.s_petname, p.s_type, p.s_breed, p.s_description, 
           p.dt_created_at, u.s_username, u.s_full_name, u.s_full_surname
    FROM pets p
    JOIN users u ON p.userid = u.id
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
 * Create new pet (atomic)
 */
async function createPet(userid, { petname, type, breed, description }) {
  const query = 'INSERT INTO pets (userid, s_petname, s_type, s_breed, s_description, b_active) VALUES (?, ?, ?, ?, ?, 1)';
  const results = await db.executeTransaction([{
    query,
    params: [userid, petname, type, breed, description]
  }]);
  
  return results[0].insertId;
}

/**
 * Update pet information (atomic)
 */
async function updatePet(petid, { petname, type, breed, description }) {
  const query = `
    UPDATE pets 
    SET s_petname = COALESCE(?, s_petname),
        s_type = COALESCE(?, s_type),
        s_breed = COALESCE(?, s_breed),
        s_description = COALESCE(?, s_description)
    WHERE id = ?
  `;
  
  return await db.executeTransaction([{
    query,
    params: [petname, type, breed, description, petid]
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

module.exports = {
  getPetById,
  getPetImages,
  createPet,
  updatePet,
  deletePet,
  getPetOwnership,
};
