# Inventory Bot Backend

Natural Language to SQL Query Service for StockMaster Inventory System.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in this directory with:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=inventory_db
   PORT=5000
   ```

   > ℹ️ A default Gemini API key is bundled in `config.js` to keep the service running out of the box. Replace it via `GEMINI_API_KEY` in your `.env` to avoid key rotation issues or quota conflicts. The model is pinned to `gemini-2.5-flash` for stability and cannot be overridden.
   > ℹ️ A default Gemini API key is bundled in `config.js` to keep the service running out of the box. Replace it via `GEMINI_API_KEY` in your `.env` to avoid key rotation issues or quota conflicts. You can also pin a specific model via `GEMINI_MODEL` (defaults to `gemini-2.5-flash`).

3. **Start the Server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Endpoints

- `GET /health` - Health check endpoint
- `GET /api/health` - Health check (frontend compatible)
- `POST /api/query` - Natural language query endpoint
- `POST /api/sql` - Generate SQL only (for debugging)
- `POST /api/execute` - Execute raw SQL (for testing)
- `GET /api/test-ai` - Test Gemini API connection

## Example Request

```bash
curl -X POST http://localhost:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the stock of iPhone 13 in Mumbai?"}'
```

## Response Format

Success:
```json
{
  "success": true,
  "question": "...",
  "sql": "SELECT ...",
  "answer": "...",
  "summary": "...",
  "data": [...],
  "rowCount": 10,
  "meta": {
    "duration": "150ms",
    "timestamp": "..."
  }
}
```

Error:
```json
{
  "success": false,
  "question": "...",
  "error": "Error message",
  "suggestion": "Helpful suggestion",
  "meta": {
    "duration": "50ms",
    "timestamp": "..."
  }
}
```

