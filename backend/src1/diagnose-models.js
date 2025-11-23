// ============================================
// Diagnostic Script - Find Working Model
// Run: node src/diagnose-models.js
// ============================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env');
  process.exit(1);
}

console.log('🔍 Diagnosing Gemini API Models...\n');
console.log(`API Key: ${apiKey.substring(0, 20)}...\n`);

const genAI = new GoogleGenerativeAI(apiKey);

// Only test the supported production model
const modelsToTest = ['gemini-2.5-flash'];

async function testModel(modelName) {
  try {
    console.log(`Testing: ${modelName.padEnd(35)} ... `);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say "test"');
    const response = await result.response;
    const text = response.text();
    console.log(`✅ WORKS! Response: "${text.trim()}"`);
    return { model: modelName, status: 'success' };
  } catch (error) {
    const errorMsg = error.message.split('\n')[0];
    if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      console.log(`❌ Not found`);
      return { model: modelName, status: 'not_found' };
    } else if (errorMsg.includes('429') || errorMsg.includes('quota')) {
      console.log(`⚠️  Quota/Rate limit (but model exists!)`);
      return { model: modelName, status: 'quota' };
    } else {
      console.log(`❌ Error: ${errorMsg.substring(0, 50)}...`);
      return { model: modelName, status: 'error', error: errorMsg };
    }
  }
}

async function diagnose() {
  console.log('Testing all model variations...\n');
  
  const results = [];
  
  for (const modelName of modelsToTest) {
    const result = await testModel(modelName);
    results.push(result);
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');
  
  const working = results.filter(r => r.status === 'success');
  const quota = results.filter(r => r.status === 'quota');
  const notFound = results.filter(r => r.status === 'not_found');
  
  if (working.length > 0) {
    console.log('✅ WORKING MODEL: gemini-2.5-flash');
  } else {
    console.log('❌ No working models found');
  }
  
  if (quota.length > 0) {
    console.log(`\n⚠️  MODELS WITH QUOTA (but exist):`);
    quota.forEach(r => {
      console.log(`   - ${r.model}`);
    });
    console.log(`   (These models exist but you've hit rate limits)`);
  }
  
  if (notFound.length > 0) {
    console.log(`\n❌ NOT FOUND: ${notFound.length} models`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (working.length === 0 && quota.length === 0) {
    console.log('\n❌ No models are working. Possible issues:');
    console.log('   1. API key might be invalid');
    console.log('   2. Package version might be outdated');
    console.log('   3. API endpoint might have changed');
    console.log('\n💡 Try: npm install @google/generative-ai@latest');
  }
}

diagnose().catch(console.error);

