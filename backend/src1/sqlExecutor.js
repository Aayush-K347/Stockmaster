// ============================================
// 📁 FILE: src/sqlExecutor.js
// ============================================
import mysql from 'mysql2/promise';
import { config } from './config.js';

let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(config.db);
  }
  return pool;
}

const FORBIDDEN_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER',
  'CREATE', 'REPLACE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE',
  'CALL', 'SET', 'LOCK', 'UNLOCK'
];

const FORBIDDEN_PATTERNS = [
  /;\s*\w/i,              // Multiple statements
  /--/,                    // SQL comments
  /\/\*/,                  // Block comments
  /INTO\s+OUTFILE/i,      // File operations
  /INTO\s+DUMPFILE/i,
  /LOAD_FILE/i,
  /BENCHMARK\s*\(/i,      // Time-based attacks
  /SLEEP\s*\(/i
];

export function validateSQL(sql) {
  const upperSQL = sql.toUpperCase().trim();
  
  // Must start with SELECT or WITH (for CTEs)
  if (!upperSQL.startsWith('SELECT') && !upperSQL.startsWith('WITH')) {
    throw new Error('Only SELECT queries are allowed.');
  }
  
  // Check for forbidden keywords
  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(sql)) {
      throw new Error(`Forbidden keyword detected: ${keyword}`);
    }
  }
  
  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(sql)) {
      throw new Error('Potentially dangerous SQL pattern detected.');
    }
  }
  
  return true;
}

function assertUserScope(sql, userId) {
  if (!userId) return;
  const pattern = new RegExp(`\\b(user_id|created_by)\\s*=\\s*${userId}\\b`, 'i');
  if (!pattern.test(sql)) {
    throw new Error('Query must include a user scope filter.');
  }
}

export async function executeSQL(sql, userId) {
  // Validate before execution
  validateSQL(sql);
  assertUserScope(sql, userId);
  
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    // Set read-only mode for extra safety
    await connection.query('SET SESSION TRANSACTION READ ONLY');
    await connection.beginTransaction();
    
    const [rows] = await connection.query(sql);
    
    await connection.rollback(); // Always rollback (read-only anyway)
    return rows;
  } catch (error) {
    await connection.rollback();
    throw new Error(`Query execution failed: ${error.message}`);
  } finally {
    connection.release();
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
