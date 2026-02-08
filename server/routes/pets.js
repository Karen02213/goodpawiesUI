// server/routes/pets.js
// Pet management routes - extracted to reduce main file redundancy
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { validateUserId, validatePetId, validatePetRegistration, validateEnhancedPetRegistration, validateEnhancedPetUpdate } = require('../middleware/validation');
const { asyncHandler, auditAction, validateOwnership } = require('../utils/errors');
const { success, errors, send } = require('../utils/response');
const petQueries = require('../db/petQueries');

// Uploads directory
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'pets');

/**
 * Save base64 image to file and return filename
 */
function saveImageFile(base64Data) {
  if (!base64Data) return null;

  // Extract mime type and data
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return null;

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = matches[2];
  const filename = `${uuidv4()}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  // Ensure directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Write file
  fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
  return filename;
}

/**
 * POST /users/:userid/pets - Create a new pet
 */
router.post('/users/:userid/pets',
  verifyToken,
  validateUserId,
  validatePetRegistration,
  auditAction('PET_REGISTRATION'),
  asyncHandler(async (req, res) => {
    const { userid } = req.params;
    const { petname, type, breed, description } = req.body;

    if (parseInt(userid) !== req.user.id && !req.user.permissions?.includes('admin')) {
      return send(res, errors.FORBIDDEN('You can only create pets for yourself'));
    }

    const petId = await petQueries.createPet(userid, { petname, type, breed, description });

    send(res, success({
      petId,
      name: petname,
      type,
      breed,
      description
    }, 'Pet registered successfully', 201));
  })
);

/**
 * POST /pets - Create a new pet with enhanced fields
 */
router.post('/',
  verifyToken,
  validateEnhancedPetRegistration,
  auditAction('ENHANCED_PET_REGISTRATION'),
  asyncHandler(async (req, res) => {
    const {
      s_petname,
      s_type,
      s_breed,
      s_description,
      s_color,
      s_age,
      s_gender,
      s_size,
      b_vaccinated,
      b_sterilized
    } = req.body;

    // Use the authenticated user's ID
    const userid = req.user.id;

    const petData = {
      s_petname,
      s_type,
      s_breed,
      s_description: s_description || null,
      s_color: s_color || null,
      s_age: s_age || null,
      s_gender,
      s_size,
      b_vaccinated: b_vaccinated || false,
      b_sterilized: b_sterilized || false
    };

    const petId = await petQueries.createPet(userid, petData);

    send(res, success({
      petId,
      ...petData
    }, 'Pet registered successfully', 201));
  })
);


//Get /pets/breeds
router.get('/breeds', async (req, res) => {
  try {
    const breeds = await petQueries.getAllBreeds();
    res.json({ breeds });
  } catch (error) {
    console.error('Error fetching breeds:', error);
    res.status(500).json({
      error: 'Error al obtener las razas'
    });
  }
});

//Get /pets/types
router.get('/types', async (req, res) => {
  try {
    const types = await petQueries.getAllPetTypes();
    res.json({ types });
  } catch (error) {
    console.error('Error fetching pet types:', error);
    res.status(500).json({
      error: 'Error al obtener los tipos de mascotas'
    });
  }
});

//Get /pets/genders
router.get('/genders', async (req, res) => {
  try {
    const genders = await petQueries.getAllGenders();
    res.json({ genders });
  } catch (error) {
    console.error('Error fetching genders:', error);
    res.status(500).json({
      error: 'Error al obtener los géneros'
    });
  }
});

//Get /pets/sizes
router.get('/sizes', async (req, res) => {
  try {
    const sizes = await petQueries.getAllSizes();
    res.json({ sizes });
  } catch (error) {
    console.error('Error fetching sizes:', error);
    res.status(500).json({
      error: 'Error al obtener los tamaños'
    });
  }
});

//Get /pets/colors
router.get('/colors', async (req, res) => {
  try {
    const colors = await petQueries.getAllColors();
    res.json({ colors });
  } catch (error) {
    console.error('Error fetching colors:', error);
    res.status(500).json({
      error: 'Error al obtener los colores'
    });
  }
});

router.get('/breeds/:petType', async (req, res) => {
  try {
    const { petType } = req.params;
    const breeds = await petQueries.getBreedsByType(petType);
    res.json({ breeds });
  } catch (error) {
    console.error('Error fetching breeds:', error);
    res.status(500).json({
      error: 'Error al obtener la raza'
    });
  }
});

/**
 * GET /pets/:petid - Get specific pet information
 */
router.get('/:petid',
  optionalAuth,
  validatePetId,
  auditAction('PET_VIEW'),
  asyncHandler(async (req, res) => {
    const { petid } = req.params;

    const pet = await petQueries.getPetById(petid);
    if (!pet) {
      return send(res, errors.NOT_FOUND('Pet'));
    }

    const images = await petQueries.getPetImages(petid);
    const imageUrl = images?.[0]?.image_id || null;

    send(res, success({
      id: pet.id,
      name: pet.s_petname,
      type: pet.s_type,
      breed: pet.s_breed,
      description: pet.s_description,
      color: pet.s_color,
      age: pet.s_age,
      gender: pet.s_gender,
      size: pet.s_size,
      vaccinated: pet.b_vaccinated,
      sterilized: pet.b_sterilized,
      createdAt: pet.dt_created_at,
      image_url: imageUrl,
      owner: {
        id: pet.userid,
        username: pet.s_username,
        fullName: pet.s_full_name,
        fullSurname: pet.s_full_surname,
        phone: pet.s_phone_number ? `${pet.s_phone_prefix || ''}${pet.s_phone_number}` : null,
        city: pet.s_city || null,
        avatar: pet.owner_avatar || null
      },
      images: images.map(img => img.image_id)
    }));
  })
);





/**
 * PUT /pets/:petid - Update pet information
 */
router.put('/:petid',
  verifyToken,
  validatePetId,
  validateEnhancedPetUpdate,
  validateOwnership(
    async (req) => {
      const ownership = await petQueries.getPetOwnership(req.params.petid);
      return ownership?.userid;
    },
    'pet'
  ),
  auditAction('PET_UPDATE'),
  asyncHandler(async (req, res) => {
    const { petid } = req.params;
    const {
      s_petname,
      s_type,
      s_breed,
      s_description,
      s_color,
      n_age,
      s_gender,
      s_size,
      b_vaccinated,
      b_sterilized,
      image_data
    } = req.body;

    await petQueries.updatePet(petid, {
      s_petname,
      s_type,
      s_breed,
      s_description,
      s_color,
      n_age,
      s_gender,
      s_size,
      b_vaccinated,
      b_sterilized
    });

    if (image_data) {
      const filename = saveImageFile(image_data);
      if (filename) {
        await petQueries.addPetImage(petid, filename);
      }
    }

    send(res, success(null, 'Pet updated successfully'));
  })
);

/**
 * DELETE /pets/:petid - Delete a pet (soft delete)
 */
router.delete('/:petid',
  verifyToken,
  validatePetId,
  validateOwnership(
    async (req) => {
      const ownership = await petQueries.getPetOwnership(req.params.petid);
      return ownership?.userid;
    },
    'pet'
  ),
  auditAction('PET_DELETION'),
  asyncHandler(async (req, res) => {
    const { petid } = req.params;

    await petQueries.deletePet(petid);
    send(res, success(null, 'Pet deleted successfully'));
  })
);



module.exports = router;
