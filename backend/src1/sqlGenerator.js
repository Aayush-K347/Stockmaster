// ============================================
// 📁 FILE: src/sqlGenerator.js
// ============================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';
import { systemPrompt } from './schema.js';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// List of model names to try (including gemini-2.5-flash and fallbacks)
const MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro'
];

// Validate that response is proper SQL
function validateAndCleanSQL(rawResponse) {
  if (!rawResponse || typeof rawResponse !== 'string') {
    throw new Error('Empty response from AI');
  }
  let sql = rawResponse.trim();
  
  // Remove markdown code fences (various formats)
  sql = sql.replace(/```sql\s*/gi, '');
  sql = sql.replace(/```mysql\s*/gi, '');
  sql = sql.replace(/```\s*/g, '');
  sql = sql.trim();
  
  // Remove any leading explanation text before SELECT/WITH
  const selectMatch = sql.match(/(SELECT|WITH)\s+/i);
  if (selectMatch) {
    sql = sql.substring(sql.indexOf(selectMatch[0]));
  }
  
  // Remove trailing explanation text after the query
  // Find the last semicolon or end of valid SQL
  const lines = sql.split('\n');
  const sqlLines = [];
  let foundEnd = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (foundEnd) break;
    
    // Skip empty lines at start
    if (sqlLines.length === 0 && !trimmed) continue;
    
    // Check if this line looks like explanation (starts with common words)
    if (sqlLines.length > 0 && /^(This|Note|The|Here|I |It |Where|Explanation)/i.test(trimmed)) {
      break;
    }
    
    sqlLines.push(line);
    
    // Check for query end
    if (trimmed.endsWith(';')) {
      foundEnd = true;
    }
  }
  
  sql = sqlLines.join('\n').trim();
  
  // Remove trailing semicolon for execution (mysql2 handles it)
  sql = sql.replace(/;+\s*$/, '');
  
  // Check for special responses
  if (/READ_ONLY_ERROR/i.test(sql)) {
    throw new Error('I can only generate read-only queries. Modifications are not allowed.');
  }
  if (/CANNOT_ANSWER/i.test(sql)) {
    throw new Error('I cannot answer this question with the available data schema.');
  }
  
  // Validate it looks like a SELECT query
  const upperSQL = sql.toUpperCase().trim();
  if (!upperSQL.startsWith('SELECT') && !upperSQL.startsWith('WITH')) {
    // Try to extract SELECT if buried in response
    const selectIdx = upperSQL.indexOf('SELECT');
    if (selectIdx !== -1) {
      sql = sql.substring(selectIdx);
    } else {
      throw new Error('AI did not generate a valid SELECT query. Please rephrase your question.');
    }
  }
  
  // Basic SQL syntax validation
  if (!sql.toLowerCase().includes('from') && !sql.toLowerCase().includes('select 1')) {
    throw new Error('Generated SQL appears incomplete. Please try again.');
  }
  
  return sql;
}

function ensureUserScope(sql, userId) {
  const userPattern = new RegExp(`(user_id|created_by)\\s*=\\s*${userId}\\b`, 'i');
  if (!userPattern.test(sql)) {
    throw new Error('Generated SQL must be scoped to the current user.');
  }
  return sql;
}

export async function generateSQL(question, userId, retries = 2) {
  // Try configured model first, then fallbacks
  const modelsToTry = [config.gemini.model, ...MODEL_FALLBACKS.filter(m => m !== config.gemini.model)];
  let lastError = null;
  
  // Try each model
  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.1,  // Low temperature for consistent SQL
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          }
        });
        
        const prompt = `${systemPrompt}

CURRENT USER ID: ${userId}
Always include a filter to ensure results are only for this user (e.g., created_by = ${userId} or user_id = ${userId}).

USER QUESTION: ${question}

IMPORTANT: Return ONLY the raw SQL query. No explanations, no markdown, no code fences. Just the SQL.

SQL:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();
        
        if (modelName !== config.gemini.model) {
          console.log(`✅ Using fallback model: ${modelName}`);
        }
        
        console.log(`🤖 Raw Gemini response:\n${rawText}\n`);
        
          // Validate, clean, and enforce user scope on the response
          const sql = ensureUserScope(validateAndCleanSQL(rawText), userId);
        
        console.log(`✅ Cleaned SQL:\n${sql}\n`);
        return sql;
        
      } catch (error) {
        lastError = error;
        
        // If it's a "model not found" error, try next model immediately
        if (error.message.includes('404') || 
            error.message.includes('not found') || 
            error.message.includes('not supported')) {
          console.log(`⚠️ Model ${modelName} not found, trying next...`);
          break; // Break inner loop, try next model
        }
        
        // Don't retry for certain errors
        if (error.message.includes('read-only') || 
            error.message.includes('cannot answer') ||
            error.message.includes('API key')) {
          throw error;
        }
        
        // For other errors, wait and retry
        if (attempt < retries) {
          console.warn(`⚠️ Attempt ${attempt + 1} failed: ${error.message.substring(0, 80)}...`);
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }
  }
  
  throw new Error(`SQL Generation failed: All models failed. Last error: ${lastError?.message?.substring(0, 200) || 'Unknown error'}`);
}
