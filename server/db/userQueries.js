// server/db/userQueries.js
// User-related database queries - modular, atomic, and ACID compliant
const db = require('./index');

/**
 * Get user profile with privacy controls
 */
async function getUserProfile(userid, isOwner = false) {
  let query, params;
  
  if (isOwner) {
    // Full profile for owner
    query = `
      SELECT u.id, u.s_username, u.s_email, u.s_full_name, u.s_full_surname,
             CONCAT(u.s_phone_prefix, u.s_phone_number) as phone,
             u.email_verified, u.phone_verified, u.dt_created_at,
             ui.s_description, ui.dt_updated_at as description_updated
      FROM users u
      LEFT JOIN user_info ui ON u.id = ui.userid AND ui.b_active = 1
      WHERE u.id = ? AND u.b_active = 1
    `;
    params = [userid];
  } else {
    // Public profile only
    query = `
      SELECT u.id, u.s_username, u.s_full_name, u.s_full_surname,
             u.dt_created_at, ui.s_description
      FROM users u
      LEFT JOIN user_info ui ON u.id = ui.userid AND ui.b_active = 1
      WHERE u.id = ? AND u.b_active = 1
    `;
    params = [userid];
  }
  
  const results = await db.executeWithNoLock(query, params);
  return results[0] || null;
}

/**
 * Get user's pets with pagination
 */
async function getUserPets(userid, limit = 20, offset = 0) {
  const query = `
    SELECT p.id, p.s_petname, p.s_type, p.s_breed, p.s_description, p.dt_created_at,
           COUNT(pi.id) as image_count,
           latest.image_id as image_url
    FROM pets p
    LEFT JOIN pets_images pi ON p.id = pi.petid AND pi.b_active = 1
    LEFT JOIN (
      SELECT pi1.petid, pi1.image_id
      FROM pets_images pi1
      INNER JOIN (
        SELECT petid, MAX(dt_created_at) as max_created
        FROM pets_images
        WHERE b_active = 1
        GROUP BY petid
      ) pi2 ON pi1.petid = pi2.petid AND pi1.dt_created_at = pi2.max_created
      WHERE pi1.b_active = 1
    ) latest ON latest.petid = p.id
    WHERE p.userid = ? AND p.b_active = 1
    GROUP BY p.id, latest.image_id
    ORDER BY p.dt_created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  return await db.executeWithNoLock(query, [userid, limit, offset]);
}

/**
 * Get count of user's pets
 */
async function getUserPetsCount(userid) {
  const query = 'SELECT COUNT(*) as total FROM pets WHERE userid = ? AND b_active = 1';
  const results = await db.executeWithNoLock(query, [userid]);
  return results[0]?.total || 0;
}

/**
 * Check if user exists
 */
async function userExists(userid) {
  const query = 'SELECT id FROM users WHERE id = ? AND b_active = 1';
  const results = await db.executeWithNoLock(query, [userid]);
  return results.length > 0;
}

/**
 * Update user profile (atomic transaction)
 */
async function updateUserProfile(userid, { fullName, fullSurname, description }) {
  const operations = [];
  
  // Update basic user information if provided
  if (fullName || fullSurname) {
    operations.push({
      query: 'UPDATE users SET s_full_name = COALESCE(?, s_full_name), s_full_surname = COALESCE(?, s_full_surname) WHERE id = ?',
      params: [fullName, fullSurname, userid]
    });
  }
  
  // Update description if provided
  if (description !== undefined) {
    // Check if user_info exists first
    const existingInfo = await db.executeWithNoLock(
      'SELECT id FROM user_info WHERE userid = ? AND b_active = 1',
      [userid]
    );
    
    if (existingInfo.length > 0) {
      operations.push({
        query: 'UPDATE user_info SET s_description = ? WHERE userid = ? AND b_active = 1',
        params: [description, userid]
      });
    } else {
      operations.push({
        query: 'INSERT INTO user_info (userid, s_description, b_active) VALUES (?, ?, 1)',
        params: [userid, description]
      });
    }
  }
  
  if (operations.length > 0) {
    return await db.executeTransaction(operations);
  }
  
  return true;
}

module.exports = {
  getUserProfile,
  getUserPets,
  getUserPetsCount,
  userExists,
  updateUserProfile,
};
