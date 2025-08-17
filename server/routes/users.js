// server/routes/users.js
// User management routes - extracted to reduce main file redundancy
const express = require('express');
const router = express.Router();
const { verifyToken, optionalAuth, requireOwnership } = require('../middleware/auth');
const { validateUserId, validatePagination } = require('../middleware/validation');
const { asyncHandler, auditAction } = require('../utils/errors');
const { success, paginated, errors, send } = require('../utils/response');
const userQueries = require('../db/userQueries');

/**
 * GET /users/:userid - Get user profile
 */
router.get('/:userid',
  optionalAuth,
  validateUserId,
  auditAction('USER_PROFILE_VIEW'),
  asyncHandler(async (req, res) => {
    const { userid } = req.params;
    const requestingUserId = req.user?.id;
    const isOwner = requestingUserId && parseInt(userid) === requestingUserId;
    
    const user = await userQueries.getUserProfile(userid, isOwner);
    if (!user) {
      return send(res, errors.NOT_FOUND('User'));
    }
    
    const pets = await userQueries.getUserPets(userid, 100, 0);
    
    const responseData = {
      id: user.id,
      username: user.s_username,
      fullName: user.s_full_name,
      fullSurname: user.s_full_surname,
      description: user.s_description,
      createdAt: user.dt_created_at,
      pets: pets.map(pet => ({
        id: pet.id,
        name: pet.s_petname,
        type: pet.s_type,
        breed: pet.s_breed,
        description: pet.s_description,
        createdAt: pet.dt_created_at
      }))
    };
    
    if (isOwner) {
      Object.assign(responseData, {
        email: user.s_email,
        phone: user.phone,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        descriptionUpdated: user.description_updated
      });
    }
    
    send(res, success(responseData));
  })
);

/**
 * PUT /users/:userid - Update user profile
 */
router.put('/:userid',
  verifyToken,
  validateUserId,
  requireOwnership('userid'),
  auditAction('USER_PROFILE_UPDATE'),
  asyncHandler(async (req, res) => {
    const { userid } = req.params;
    const { fullName, fullSurname, description } = req.body;
    
    await userQueries.updateUserProfile(userid, { fullName, fullSurname, description });
    send(res, success(null, 'Profile updated successfully'));
  })
);

/**
 * GET /users/:userid/pets - Get user's pets
 */
router.get('/:userid/pets',
  optionalAuth,
  validateUserId,
  validatePagination,
  auditAction('USER_PETS_VIEW'),
  asyncHandler(async (req, res) => {
    const { userid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const userExists = await userQueries.userExists(userid);
    if (!userExists) {
      return send(res, errors.NOT_FOUND('User'));
    }
    
    const pets = await userQueries.getUserPets(userid, limit, offset);
    const totalPets = await userQueries.getUserPetsCount(userid);
    const totalPages = Math.ceil(totalPets / limit);
    
    const paginatedPets = pets.map(pet => ({
      id: pet.id,
      name: pet.s_petname,
      type: pet.s_type,
      breed: pet.s_breed,
      description: pet.s_description,
      imageCount: pet.image_count,
      createdAt: pet.dt_created_at
    }));
    
    const pagination = {
      currentPage: page,
      totalPages,
      totalItems: totalPets,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
    
    send(res, paginated(paginatedPets, pagination));
  })
);

module.exports = router;
