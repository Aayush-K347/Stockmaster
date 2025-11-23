// ============================================
// 📁 FILE: src/index.js
// ============================================
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { generateSQL } from './sqlGenerator.js';
import { executeSQL, closePool } from './sqlExecutor.js';
import { formatResult } from './nlFormatter.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Health check (also available at /api/health for frontend compatibility)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main query endpoint
app.post('/api/query', async (req, res) => {
  const startTime = Date.now();
  const { question, userId } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid question.'
    });
  }

  const numericUserId = Number(userId);
  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'A valid userId is required to scope results.'
    });
  }

  if (question.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Question is too short. Please be more specific.'
    });
  }

  try {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📝 Question: "${question}"`);

    // Step 1: Generate SQL
    const sql = await generateSQL(question, numericUserId);
    console.log(`🔧 Generated SQL:\n${sql}`);

    // Step 2: Execute SQL
    const results = await executeSQL(sql);
    console.log(`📊 Results: ${results.length} rows`);

    // Step 3: Format response
    const formatted = formatResult(question, results, sql);

    const duration = Date.now() - startTime;
    console.log(`✅ Completed in ${duration}ms\n`);

    res.json({
      success: true,
      question,
      sql,
      ...formatted,
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error: ${error.message}\n`);
    
    const statusCode = 
      error.message.includes('read-only') ? 400 :
      error.message.includes('cannot answer') ? 400 :
      error.message.includes('too short') ? 400 :
      error.message.includes('valid SELECT') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      question,
      answer: `Error: ${error.message}`, // Also include in answer field for frontend compatibility
      error: error.message,
      suggestion: getSuggestion(error.message),
      data: [],
      rowCount: 0,
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Helper function for error suggestions
function getSuggestion(errorMessage) {
  if (errorMessage.includes('valid SELECT')) {
    return 'Try rephrasing your question. Example: "What is the stock of iPhone 13?"';
  }
  if (errorMessage.includes('incomplete')) {
    return 'Your question may be too vague. Try being more specific about what data you need.';
  }
  if (errorMessage.includes('read-only')) {
    return 'I can only answer questions, not make changes. Ask about stock levels, valuations, etc.';
  }
  return null;
}

// SQL-only endpoint (for debugging)
app.post('/api/sql', async (req, res) => {
  const { question, userId } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question required' });
  }

  const numericUserId = Number(userId);
  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return res.status(400).json({ error: 'A valid userId is required' });
  }

  try {
    const sql = await generateSQL(question, numericUserId);
    res.json({ success: true, sql });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute raw SQL (protected, for testing)
app.post('/api/execute', async (req, res) => {
  const { sql, userId } = req.body;

  if (!sql) {
    return res.status(400).json({ error: 'SQL query required' });
  }

  const numericUserId = Number(userId);
  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return res.status(400).json({ error: 'A valid userId is required' });
  }

  try {
    const scopePattern = new RegExp(`(user_id|created_by)\\s*=\\s*${numericUserId}\\b`, 'i');
    if (!scopePattern.test(sql)) {
      return res.status(400).json({ error: 'SQL must be scoped to the requesting user' });
    }

    const results = await executeSQL(sql);
    res.json({ success: true, data: results, rowCount: results.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint to verify Gemini API connection
app.get('/api/test-ai', async (req, res) => {
  try {
    const sql = await generateSQL('list all warehouses', 1);
    res.json({ 
      success: true, 
      message: 'Gemini API is working!',
      testQuery: sql 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: 'Check your GEMINI_API_KEY in .env'
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

// Start server
app.listen(config.server.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║       🤖 Inventory Bot Backend Running            ║
║───────────────────────────────────────────────────║
║   Port: ${config.server.port}                                      ║
║   Endpoints:                                      ║
║     POST /api/query   - Natural language query    ║
║     POST /api/sql     - Generate SQL only         ║
║     POST /api/execute - Execute raw SQL           ║
║     GET  /api/test-ai - Test Gemini connection    ║
║     GET  /health      - Health check              ║
╚═══════════════════════════════════════════════════╝
  `);
});

export default app;
