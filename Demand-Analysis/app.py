from flask import Flask, jsonify, render_template
from sqlalchemy import create_engine, text
from services.forecasting import DemandForecaster
import uuid
from flask import request

app = Flask(__name__)

# Configure your DB connection string here
# format: mysql+pymysql://user:password@host/db_name
DB_URI = 'mysql+pymysql://stock_user:hackstreet@127.0.0.1/stock_master_db'
engine = create_engine(DB_URI)

@app.route('/dashboard')
def dashboard_view():
    return render_template('dashboard.html')

@app.route('/api/forecast/generate', methods=['POST'])
def trigger_forecast():
    """
    Admin endpoint to trigger the AI analysis.
    In production, protect this with @login_required and @admin_only
    """
    try:
        forecaster = DemandForecaster(engine)
        forecaster.generate_forecasts()
        return jsonify({"status": "success", "message": "Demand forecasting completed."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Smart Alerts endpoint
@app.route('/api/dashboard/smart-alerts', methods=['GET'])
def get_smart_alerts():
    """
    Returns products where Current Stock is insufficient to cover
    AI-Predicted Demand for the next 7 days.
    """
    sql = text("""
        WITH Stock AS (
            SELECT product_id, SUM(quantity) as total_qty 
            FROM inventory_stockquant 
            GROUP BY product_id
        ),
        Demand AS (
            SELECT product_id, SUM(predicted_quantity) as needed_qty
            FROM inventory_demand_forecast
            WHERE forecast_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)
            GROUP BY product_id
        )
        SELECT 
            p.id, 
            p.name, 
            p.sku,
            COALESCE(s.total_qty, 0) as current_stock,
            COALESCE(d.needed_qty, 0) as predicted_demand
        FROM inventory_product p
        LEFT JOIN Stock s ON p.id = s.product_id
        LEFT JOIN Demand d ON p.id = d.product_id
        WHERE COALESCE(s.total_qty, 0) < COALESCE(d.needed_qty, 0)
    """)

    alerts = []
    with engine.connect() as conn:
        rows = conn.execute(sql).fetchall()
        for row in rows:
            stock = float(row[3])
            demand = float(row[4])
            deficit = demand - stock
            alerts.append({
                "product_id": row[0],
                "product_name": row[1],
                "sku": row[2],
                "current_stock": stock,
                "predicted_demand_7d": round(demand, 2),
                "shortage_estimation": round(deficit, 2),
                "alert_level": "CRITICAL" if stock == 0 else "WARNING"
            })

    return jsonify({
        "count": len(alerts),
        "alerts": alerts
    })

# Endpoint to get forecast data for the dashboard
@app.route('/api/forecast/<int:product_id>', methods=['GET'])
def get_product_forecast(product_id):
    sql = text("""
        SELECT forecast_date, predicted_quantity, confidence_lower, confidence_upper
        FROM inventory_demand_forecast
        WHERE product_id = :pid AND forecast_date >= CURRENT_DATE
        ORDER BY forecast_date ASC LIMIT 30
    """)
    
    results = []
    with engine.connect() as conn:
        rows = conn.execute(sql, {"pid": product_id}).fetchall()
        for row in rows:
            results.append({
                "date": str(row[0]),
                "qty": float(row[1]),
                "range": [float(row[2]), float(row[3])]
            })
            
    return jsonify(results)

@app.route('/api/procurement/auto-reorder', methods=['POST'])
def auto_reorder():
    """
    Converts a shortage alert into a Draft Receipt (Purchase Order).
    Payload: { "product_id": 2, "quantity": 48, "vendor": "Best Steel Co" }
    """
    data = request.json
    product_id = data.get('product_id')
    quantity = data.get('quantity')
    vendor = data.get('vendor', 'Pending Vendor') # Default if no vendor selected

    if not product_id or not quantity:
        return jsonify({"status": "error", "message": "Missing product_id or quantity"}), 400

    # Generate a unique reference for this auto-order
    po_ref = f"PO-AUTO-{uuid.uuid4().hex[:8].upper()}"

    try:
        with engine.begin() as conn: # Transaction block
            # 1. Create the Stock Move Header (The "Order")
            # We set dest_location_id to 1 (Assuming 1 is the main warehouse input)
            move_sql = text("""
                INSERT INTO inventory_stockmove 
                (type, reference, contact, status, scheduled_date, created_at, notes, dest_location_id)
                VALUES 
                ('RECEIPT', :ref, :vendor, 'DRAFT', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), NOW(), 'AI Generated based on Forecast', 1)
            """)
            
            result = conn.execute(move_sql, {
                "ref": po_ref, 
                "vendor": vendor
            })
            
            # Get the ID of the move we just created
            # (LastRowID equivalent in SQLAlchemy depends on driver, but execute returns result.lastrowid)
            stockmove_id = result.lastrowid

            # 2. Create the Line Item (The Product & Qty)
            line_sql = text("""
                INSERT INTO inventory_stocktransfer (stockmove_id, product_id, quantity)
                VALUES (:move_id, :pid, :qty)
            """)
            
            conn.execute(line_sql, {
                "move_id": stockmove_id,
                "pid": product_id,
                "qty": quantity
            })

        return jsonify({
            "status": "success",
            "message": f"Draft Order {po_ref} created successfully.",
            "order_reference": po_ref,
            "stockmove_id": stockmove_id
        }), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app on a safe port (Chrome blocks 6000 as unsafe)
    app.run(host='127.0.0.1', port=8080, debug=True)
