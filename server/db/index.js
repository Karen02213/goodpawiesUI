// server/db/index.js
// Centralized DB pool and connection manager
const mysql = require('mysql2/promise');
const { createDbConfig } = require('../utils/database');

// Create connection pool using centralized config
const pool = mysql.createPool(createDbConfig());

/**
 * Execute query with NOLOCK (READ UNCOMMITTED isolation level)
 * For better performance in read operations
 */
async function executeWithNoLock(query, params = []) {
  const connection = await pool.getConnection();
  try {
    await connection.execute('SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED');
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    connection.release();
  }
}

/**
 * Execute transaction with ACID properties
 * Ensures atomicity, consistency, isolation, durability
 */
async function executeTransaction(operations) {
  const connection = await pool.getConnection();
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
    connection.release();
  }
}

/**
 * Get single connection for complex operations
 */
async function getConnection() {
  return await pool.getConnection();
}

/**
 * Execute single query (for simple operations)
 */
async function execute(query, params = []) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  execute,
  executeWithNoLock,
  executeTransaction,
  getConnection,
};
