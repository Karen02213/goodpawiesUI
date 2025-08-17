// server/utils/database.js
// Database utility functions to reduce redundancy

const mysql = require('mysql2/promise');

/**
 * Create a reusable database connection configuration
 */
const createDbConfig = () => ({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'goodpawiesuser', 
  password: process.env.DB_PASSWORD || 'goodpawiespass',
  database: process.env.DB_NAME || 'goodpawiesdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Create a temporary database connection (for one-off operations)
 */
const createConnection = async () => {
  return await mysql.createConnection(createDbConfig());
};

/**
 * Execute query with automatic connection cleanup
 */
const executeQuery = async (query, params = []) => {
  const connection = await createConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    await connection.end();
  }
};

/**
 * Execute multiple queries in a transaction with automatic cleanup
 */
const executeTransaction = async (operations) => {
  const connection = await createConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const operation of operations) {
      const [result] = await connection.execute(operation.query, operation.params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
};

/**
 * Common query patterns
 */
const queryPatterns = {
  // Check if record exists
  exists: (table, idField = 'id') => `SELECT ${idField} FROM ${table} WHERE ${idField} = ? AND b_active = 1`,
  
  // Count records
  count: (table, whereClause = '') => `SELECT COUNT(*) as total FROM ${table} ${whereClause}`,
  
  // Soft delete
  softDelete: (table, idField = 'id') => `UPDATE ${table} SET b_active = 0 WHERE ${idField} = ?`,
  
  // Get with pagination
  paginated: (selectFields, table, whereClause = '', orderBy = '', limit, offset) => 
    `SELECT ${selectFields} FROM ${table} ${whereClause} ${orderBy} LIMIT ${limit} OFFSET ${offset}`
};

module.exports = {
  createDbConfig,
  createConnection,
  executeQuery,
  executeTransaction,
  queryPatterns
};
