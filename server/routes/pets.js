// server/routes/pets.js
// Pet management routes - extracted to reduce main file redundancy
const express = require('express');
const router = express.Router();
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { validateUserId, validatePetId, validatePetRegistration } = require('../middleware/validation');
const { asyncHandler, auditAction, validateOwnership } = require('../utils/errors');
const { success, errors, send } = require('../utils/response');
const petQueries = require('../db/petQueries');

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
    
    send(res, success({
      id: pet.id,
      name: pet.s_petname,
      type: pet.s_type,
      breed: pet.s_breed,
      description: pet.s_description,
      createdAt: pet.dt_created_at,
      owner: {
        id: pet.userid,
        username: pet.s_username,
        fullName: pet.s_full_name,
        fullSurname: pet.s_full_surname
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
    const { petname, type, breed, description } = req.body;
    
    await petQueries.updatePet(petid, { petname, type, breed, description });
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
