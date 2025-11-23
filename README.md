<div align="center">

  <h1>📦 StockMaster — Intelligent Inventory Management</h1>
  <h3><em>AI-powered demand forecasting meets seamless Odoo integration.</em></h3>

</div>

<!-- Terminal Intro Animation -->
<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&duration=2000&pause=700&color=00FFFF&center=true&width=700&lines=Initializing+StockMaster+System...;Loading+Prophet+AI+Engine...;Analyzing+Historical+Data...;Predicting+Future+Demand...;System+Ready!" alt="Terminal Animation">
</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="Divider">

## 🎯 Problem & Inspiration

<table>
<tr>
<td>

Traditional inventory management is reactive — businesses discover stockouts only when it's too late. StockMaster transforms this approach by combining **AI-powered demand forecasting** with **automated procurement workflows**. Our system predicts future demand, alerts managers to potential shortages, and enables **one-click reordering** — all integrated seamlessly with Odoo ERP.

</td>
<td width="40%">
<img src="/images/Sinal Stock.png" width="100%" alt="StockMaster Dashboard">
</td>
</tr>
</table>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=divider">

## Landing Page

<img src="/images/landingpage.png" alt="Dashboard Overview" width="100%">

## 🧠 What It Does

<div align="center">
  <table>
    <tr>
      <td align="center"><h3>📈</h3><h4>AI Forecasting</h4><p>30-day demand prediction using Prophet ML</p></td>
      <td align="center"><h3>⚠️</h3><h4>Smart Alerts</h4><p>Real-time shortage detection with confidence intervals</p></td>
    </tr>
    <tr>
      <td align="center"><h3>🛒</h3><h4>Auto Procurement</h4><p>One-click purchase order generation</p></td>
      <td align="center"><h3>📊</h3><h4>Visual Dashboard</h4><p>Interactive charts with glassmorphism UI</p></td>
    </tr>
    <tr>
      <td align="center"><h3>🔄</h3><h4>Odoo Integration</h4><p>Seamless sync with existing ERP workflows</p></td>
      <td align="center"><h3>🎯</h3><h4>Seasonality Detection</h4><p>Automatic trend and pattern recognition</p></td>
    </tr>
  
  </table>
</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🔮 AI-Powered Demand Forecasting & Smart Procurement

This module transforms StockMaster from a simple reactive record-keeper into a **proactive decision engine**. By utilizing **Facebook's Prophet model**, the system analyzes historical sales data to predict future demand, identifying potential stockouts before they happen.

### 🚀 Key Capabilities

#### 1. Intelligent Forecasting Engine (The Brain)
- **Time-Series Analysis**: Uses machine learning to analyze historical `inventory_stockmove` data
- **Seasonality Detection**: Automatically detects weekly trends (e.g., weekend spikes) and long-term seasonal shifts
- **30-Day Prediction**: Generates precise daily demand forecasts for the upcoming month with confidence intervals (Best case vs. Worst case)

#### 2. Real-Time "Smart Alerts" (The Voice)
- **Dynamic Comparison**: Instantly compares Current Stock Levels against AI-Predicted Demand for the next 7 days
- **Risk Detection**: Triggers a CRITICAL or WARNING alert only when stock is insufficient to cover the predicted sales
- **Noise Reduction**: Filters out healthy stock items, focusing the manager's attention only on what needs action

#### 3. Automated Procurement (The Hands)
- **One-Click Reordering**: Users can convert an AI shortage alert into a concrete Purchase Order (Draft Receipt) with a single click
- **Contextual Data**: The system automatically calculates the exact shortage quantity based on the forecast, eliminating guesswork

<img src="/images/2.jpeg" alt="Dashboard Overview" width="100%">

<img src="/images/1.jpeg" alt="Dashboard Overview" width="100%">



#### 4. Automatic Stock Manager Dashboard
- **Glassmorphism UI**: A modern, dark-mode interface built with Bootstrap 5 and custom CSS
- **Interactive Visualization**: Uses Chart.js to render the forecast curve, allowing users to visualize the predicted demand trend vs. current stock

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=divider">

## ⚙️ Tech Stack

<div align="center">

**Backend:** Python • Flask • Prophet (Facebook AI) • MySQL • SQLAlchemy  
**Frontend:** React • Bootstrap 5 • Chart.js • Glassmorphism CSS  
**Integration:** Odoo XML-RPC • REST API  
**ML/AI:** Time-Series Forecasting • Seasonality Detection

</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🛠️ Technical Workflow

1. **ETL Process**: Python extracts completed delivery data from MySQL (`inventory_stockmove`)
2. **Training**: The Prophet library trains a model per product on historical data
3. **Inference**: The model predicts `yhat` (quantity) for `ds` (future dates) and stores results in `inventory_demand_forecast`
4. **Logic Layer**: The Flask API calculates `Shortage = (Predicted_7_Days) - (Current_Stock_Hand)`
5. **Action**: On user confirmation, an SQL transaction creates a new RECEIPT record in `inventory_stockmove`

<br><br>
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:f7971e,100:ffd200&height=100&section=divider&text=Target%20Users&fontColor=ffffff&fontSize=28&animation=twinkling">

- 📊 **Inventory Managers** – Proactive shortage alerts and automated reordering  
- 🏢 **Operations Teams** – Real-time visibility into stock levels and demand trends  
- 💼 **Procurement Specialists** – Data-driven purchase order generation
- 🔧 **ERP Administrators** – Seamless Odoo integration with minimal setup

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🚀 How to Run

### Prerequisites
- Python 3.8+
- MySQL/PostgreSQL database
- Odoo instance (optional, for full integration)

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/StockMaster-Odoo-X-SPIT.git
cd StockMaster-Odoo-X-SPIT
```

#### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Configure database connection in config.py or .env
# DB_HOST=localhost
# DB_USER=your_user
# DB_PASS=your_password
# DB_NAME=stockmaster

python app.py
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

#### 4. AI Forecasting Feature

**Navigate to the AI module:**
```bash
cd feature1
pip install -r requirements.txt
```

**Generate Initial Forecasts (run this first):**
```bash
# This will train the Prophet model and generate 30-day predictions.
# Replace <YOUR-APP-URL> with the deployed host (e.g., https://your-app-url.com).
curl -X POST <YOUR-APP-URL>/api/forecast/generate
```

**Start the Dashboard:**
```bash
python app.py
```

**Access the Dashboard:**
Open your browser and navigate to your deployed host:
```
<YOUR-APP-URL>/dashboard
```

### ⚡ Quick Commands
```bash
# Update forecasts (run daily via cron)
curl -X POST <YOUR-APP-URL>/api/forecast/generate

# View smart alerts
curl <YOUR-APP-URL>/api/alerts

# Generate purchase order
curl -X POST <YOUR-APP-URL>/api/procurement/create \
  -H "Content-Type: application/json" \
  -d '{"product_id": 123, "quantity": 50}'
```

<br><br>
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=divider&text=Roadmap&fontColor=ffffff&fontSize=28&animation=twinkling">

- ✅ Core MVP: AI forecasting, smart alerts, auto procurement  
- 🔄 Multi-warehouse support with location-based predictions  
- 📱 Mobile app for on-the-go inventory management  
- 🌐 API marketplace for third-party integrations  
- 🤖 Advanced ML models (LSTM, Transformer-based forecasting)
- 📧 Email/SMS alert notifications for critical shortages
- 📈 Advanced analytics with custom reporting dashboards

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="Divider">

## 📸 Demo Screenshots

<div align="center">
  <table>
    <tr>
      <td><img src="/images/dashboard.jpeg" alt="Dashboard" width="100%"></td>
      <td><img src="/images/products.jpeg" alt="Products" width="100%"></td>
    </tr>
    <tr>
      <td><img src="/images/receipts.jpeg" alt="Receipts" width="100%"></td>
      <td><img src="/images/deliveries.jpeg" alt="Deliveries" width="100%"></td>
    </tr>
    <tr>
      <td><img src="/images/adjustments.jpeg" alt="Adjustments" width="100%"></td>
      <td><img src="/images/automated_stock_manager.jpeg" alt="Automated Stock Manager" width="100%"></td>
    </tr>
        <tr>
      <td><img src="/images/stock_ledger.jpeg" alt="Stock Ledger" width="100%"></td>
      <td><img src="/images/internal_transfers.jpeg" alt="Internal Transfers" width="100%"></td>
    </tr>

  </table>
</div>
## 📊 Feature Preview

<div align="center">
  <img src="/images/dashboard-hero.png" alt="AI Dashboard Preview" width="80%">
  <p><em>Interactive dashboard showing AI predictions, confidence intervals, and shortage alerts</em></p>
</div>

## 🎯 Project Structure

```
StockMaster-Odoo-X-SPIT/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models/                # Database models
│   ├── controllers/           # API endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Dashboard pages
│   │   └── styles/           # CSS/styling
│   └── package.json
├── feature1/                  # AI Forecasting Module
│   ├── app.py                # Forecasting API
│   ├── prophet_model.py      # ML training logic
│   └── requirements.txt
└── odoo_modules/             # Odoo custom modules
```

## 🔗 Useful Links
<div align="center">
  <a href="https://www.linkedin.com/in/aayushkolte/" target="_blank">
    <img src="https://img.shields.io/badge/Aayush_Kolte-LinkedIn-blue?style=for-the-badge&logo=linkedin&logoColor=white" alt="Aayush Kolte">
  </a>
  <a href="https://www.linkedin.com/in/akshat-sanjay-patil/?miniProfileUrn=urn%3Ali%3Afs_miniProfile%3AACoAAFG4OzEB0sb_rfikqAW2Jv0aBfi4AxXjvF0" target="_blank">
    <img src="https://img.shields.io/badge/Akshat_Patil-LinkedIn-blue?style=for-the-badge&logo=linkedin&logoColor=white" alt="Akshat Patil">
  </a>
  <a href="https://www.linkedin.com/in/hitanshu--nayan-rathi/" target="_blank">
    <img src="https://img.shields.io/badge/Hitanshu_Rathi-LinkedIn-blue?style=for-the-badge&logo=linkedin&logoColor=white" alt="Hitanshu Rathi">
  </a>
  <a href="https://www.linkedin.com/in/dhirensacher" target="_blank">
    <img src="https://img.shields.io/badge/Dhiren_Sacher-LinkedIn-blue?style=for-the-badge&logo=linkedin&logoColor=white" alt="Dhiren Sacher">
  </a>
</div>

<br>

> 📦 *"StockMaster — Never run out of stock again"*

<div align="center">
  <sub>Built with ❤️ by Team HackStreet</sub>
</div>
