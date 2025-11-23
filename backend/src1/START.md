# Quick Start Guide - Inventory Bot Backend

## Prerequisites

1. Node.js (v18 or higher)
2. MySQL database with the inventory schema
3. Gemini API key from Google AI Studio

## Setup Steps

1. **Navigate to the backend directory**
   ```bash
   cd backend/src1
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in `backend/src1/` with:
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

   > ℹ️ A default Gemini API key and the `gemini-2.5-flash` model are configured in `config.js` so the service can start immediately. Override them in your `.env` to use your own credentials and model preference via `GEMINI_API_KEY` and `GEMINI_MODEL`.

4. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Verify the server is running**
   
   The server should start on port 5000 (or the port specified in your .env).
   You should see:
   ```
   ╔═══════════════════════════════════════════════════╗
   ║       🤖 Inventory Bot Backend Running            ║
   ║───────────────────────────────────────────────────║
   ║   Port: 5000                                       ║
   ║   Endpoints:                                      ║
   ║     POST /api/query   - Natural language query    ║
   ║     POST /api/sql     - Generate SQL only         ║
   ║     POST /api/execute - Execute raw SQL           ║
   ║     GET  /api/test-ai - Test Gemini connection    ║
   ║     GET  /health      - Health check              ║
   ╚═══════════════════════════════════════════════════╝
   ```

## Testing the Connection

1. **Test health endpoint**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test AI connection**
   ```bash
   curl http://localhost:5000/api/test-ai
   ```

3. **Test a query**
   ```bash
   curl -X POST http://localhost:5000/api/query \
     -H "Content-Type: application/json" \
     -d '{"question": "List all warehouses"}'
   ```

## Frontend Integration

The frontend is already configured to connect to `http://localhost:5000`. 

To use the Inventory Bot:
1. Start this backend server (`npm start` in `backend/src1`)
2. Start the frontend (`npm run dev` in `frontend`)
3. Navigate to the Inventory Bot page in the frontend
4. The connection status indicator should show "Connected" when the backend is running

## Troubleshooting

- **Connection refused**: Make sure the backend is running on port 5000
- **Database connection error**: Check your database credentials in `.env`
- **Gemini API error**: Verify your `GEMINI_API_KEY` is correct
- **CORS errors**: The backend has CORS enabled, but make sure both servers are running

