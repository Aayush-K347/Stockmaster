import pandas as pd
from prophet import Prophet
from sqlalchemy import text
from datetime import datetime
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DemandForecaster:
    def __init__(self, db_engine):
        """
        :param db_engine: SQLAlchemy engine instance
        """
        self.db_engine = db_engine

    def generate_forecasts(self):
        """
        Main entry point to generate forecasts for all eligible products.
        """
        logger.info("Starting Demand Forecasting...")
        
        # 1. Get list of products that have movement history
        products_query = """
            SELECT DISTINCT product_id 
            FROM inventory_stocktransfer t
            JOIN inventory_stockmove m ON t.stockmove_id = m.id
            WHERE m.type = 'DELIVERY' AND m.status = 'DONE'
        """
        
        with self.db_engine.connect() as conn:
            products = pd.read_sql(products_query, conn)

        for _, row in products.iterrows():
            self._process_product(row['product_id'])
            
        logger.info("Forecasting completed.")

    def _process_product(self, product_id):
        """
        Trains model and saves prediction for a single product.
        """
        # 2. Extract Data: Get historical daily sales for this product
        query = text("""
            SELECT 
                m.scheduled_date as ds,
                SUM(t.quantity) as y
            FROM inventory_stockmove m
            JOIN inventory_stocktransfer t ON m.id = t.stockmove_id
            WHERE m.type = 'DELIVERY' 
              AND m.status = 'DONE'
              AND t.product_id = :pid
            GROUP BY m.scheduled_date
            ORDER BY m.scheduled_date ASC
        """)

        with self.db_engine.connect() as conn:
            df = pd.read_sql(query, conn, params={"pid": product_id})

        # 3. Validation: Prophet needs at least 2 rows, but 5+ is better for any accuracy
        if len(df) < 5:
            logger.warning(f"Skipping Product {product_id}: Not enough data ({len(df)} rows)")
            return

        # Ensure dates are datetime objects
        df['ds'] = pd.to_datetime(df['ds'])

        try:
            # 4. Train Prophet Model
            # daily_seasonality=True helps if you have daily data, yearly_seasonality for long history
            model = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=False)
            model.fit(df)

            # 5. Make Future DataFrame (30 days out)
            future = model.make_future_dataframe(periods=30)
            forecast = model.predict(future)

            # Filter only future dates
            today = pd.Timestamp(datetime.now().date())
            future_forecast = forecast[forecast['ds'] > today][['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

            # 6. Save to Database
            self._save_forecast(product_id, future_forecast)
            logger.info(f"Forecast generated for Product {product_id}")

        except Exception as e:
            logger.error(f"Error forecasting Product {product_id}: {str(e)}")

    def _save_forecast(self, product_id, forecast_df):
        """
        Bulk upsert the forecast data into MySQL.
        """
        data_to_insert = []
        for _, row in forecast_df.iterrows():
            # Ensure no negative predictions (impossible demand)
            pred_qty = max(0, row['yhat'])
            
            data_to_insert.append({
                "product_id": product_id,
                "forecast_date": row['ds'].strftime('%Y-%m-%d'),
                "predicted_quantity": round(pred_qty, 2),
                "confidence_lower": round(max(0, row['yhat_lower']), 2),
                "confidence_upper": round(max(0, row['yhat_upper']), 2)
            })

        # We use INSERT ... ON DUPLICATE KEY UPDATE logic
        # Since SQLAlchemy bulk operations can be tricky with upserts, we'll loop raw SQL for safety
        # or use pandas to_sql with 'append' and handle duplicates manually.
        # Here is a raw SQL approach for maximum compatibility:
        
        sql = text("""
            INSERT INTO inventory_demand_forecast 
            (product_id, forecast_date, predicted_quantity, confidence_lower, confidence_upper)
            VALUES (:product_id, :forecast_date, :predicted_quantity, :confidence_lower, :confidence_upper)
            ON DUPLICATE KEY UPDATE 
            predicted_quantity = VALUES(predicted_quantity),
            confidence_lower = VALUES(confidence_lower),
            confidence_upper = VALUES(confidence_upper),
            created_at = NOW();
        """)

        with self.db_engine.begin() as conn:
            for row in data_to_insert:
                conn.execute(sql, row)