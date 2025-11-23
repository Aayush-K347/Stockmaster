// ============================================
// List Available Gemini Models
// Run: node src/list-models.js
// ============================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('🔍 Fetching available models...\n');
    
    // Try to list models using the API
    const models = await genAI.listModels();
    
    console.log('✅ Available models:\n');
    for await (const model of models) {
      console.log(`  - ${model.name}`);
      console.log(`    Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    }
    
    // Test common model names
    console.log('\n🧪 Testing common model names:\n');
    const testModels = ['gemini-2.5-flash'];
    
    for (const modelName of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "test"');
        const response = await result.response;
        console.log(`✅ ${modelName} - WORKS!`);
      } catch (error) {
        console.log(`❌ ${modelName} - ${error.message.split('\n')[0]}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    console.log('\n📝 Trying direct model test instead...\n');
    
    // Fallback: test models directly
    const testModels = ['gemini-2.5-flash'];
    
    for (const modelName of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('test');
        await result.response;
        console.log(`✅ ${modelName} - WORKS!`);
      } catch (error) {
        const shortError = error.message.split('\n')[0].substring(0, 80);
        console.log(`❌ ${modelName} - ${shortError}...`);
      }
    }
  }
}

listModels().catch(console.error);

