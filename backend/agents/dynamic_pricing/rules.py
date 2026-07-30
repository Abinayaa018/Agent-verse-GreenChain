import logging
import numpy as np
from typing import List, Dict, Any
from sklearn.linear_model import LinearRegression
from .models import PricingRecommendationResponse

logger = logging.getLogger("dynamic_pricing.rules")

# Curated mock historical transactions to train the regression model
HISTORICAL_DATA = {
    "plastic": [
        {"quantity": 100, "days_ago": 90, "price": 22.0},
        {"quantity": 500, "days_ago": 60, "price": 24.5},
        {"quantity": 1000, "days_ago": 30, "price": 26.0},
        {"quantity": 250, "days_ago": 15, "price": 25.2},
        {"quantity": 800, "days_ago": 5, "price": 27.5},
    ],
    "metal": [
        {"quantity": 100, "days_ago": 90, "price": 95.0},
        {"quantity": 300, "days_ago": 60, "price": 102.0},
        {"quantity": 800, "days_ago": 30, "price": 112.5},
        {"quantity": 400, "days_ago": 15, "price": 108.0},
        {"quantity": 1200, "days_ago": 5, "price": 118.0},
    ],
    "battery": [
        {"quantity": 50, "days_ago": 90, "price": 140.0},
        {"quantity": 100, "days_ago": 60, "price": 145.0},
        {"quantity": 200, "days_ago": 30, "price": 152.0},
        {"quantity": 80, "days_ago": 15, "price": 148.5},
        {"quantity": 300, "days_ago": 5, "price": 158.0},
    ],
    "textile": [
        {"quantity": 200, "days_ago": 90, "price": 12.0},
        {"quantity": 600, "days_ago": 60, "price": 13.5},
        {"quantity": 1500, "days_ago": 30, "price": 15.0},
        {"quantity": 400, "days_ago": 15, "price": 14.2},
        {"quantity": 2000, "days_ago": 5, "price": 16.5},
    ],
    "organic": [
        {"quantity": 500, "days_ago": 90, "price": 4.5},
        {"quantity": 1000, "days_ago": 60, "price": 4.8},
        {"quantity": 2000, "days_ago": 30, "price": 5.2},
        {"quantity": 800, "days_ago": 15, "price": 5.0},
        {"quantity": 3000, "days_ago": 5, "price": 5.5},
    ]
}

BASE_PRICES = {
    "plastic": 25.0,
    "metal": 110.0,
    "battery": 150.0,
    "textile": 15.0,
    "organic": 5.0,
    "glass": 18.0,
    "paper": 12.0,
}

class DynamicPricingEngine:
    """Predicts recommended market prices and forecasts trends using Linear Regression."""

    def recommend_price(self, material_type: str) -> PricingRecommendationResponse:
        mat_lower = material_type.lower().strip()
        
        # Check if we have historical regression data
        data = HISTORICAL_DATA.get(mat_lower)
        
        if data and len(data) >= 3:
            try:
                # Features: [[quantity, time_index]]
                # We model time_index as days from start (90 - days_ago) so time goes forward!
                X = np.array([[item["quantity"], 90 - item["days_ago"]] for item in data])
                y = np.array([item["price"] for item in data])
                
                # Fit linear regression model
                model = LinearRegression()
                model.fit(X, y)
                
                # Predict current price for standard 500kg quantity today (time_index = 90)
                current_qty = 500.0
                current_time = 90.0
                recommended_price = float(model.predict([[current_qty, current_time]])[0])
                
                # Predict next 3 months (30, 60, 90 days into future)
                future_prediction = []
                months = ["Month +1", "Month +2", "Month +3"]
                for i, m_name in enumerate(months, 1):
                    future_time = 90.0 + (i * 30)
                    pred_val = float(model.predict([[current_qty, future_time]])[0])
                    future_prediction.append({
                        "month": m_name,
                        "price": round(max(1.0, pred_val), 2)
                    })
                
                # Find trend based on time coefficient (X[:, 1])
                time_coef = model.coef_[1]
                if time_coef > 0.05:
                    trend = "UPWARD"
                elif time_coef < -0.05:
                    trend = "DOWNWARD"
                else:
                    trend = "STABLE"
                    
                # Calculate scores
                demand_score = round(min(10.0, max(0.0, 5.0 + time_coef * 10.0)), 1)
                supply_score = round(min(10.0, max(0.0, 7.0 - (model.coef_[0] * 100.0))), 1)
                
                return PricingRecommendationResponse(
                    material_type=material_type,
                    recommended_price_inr_per_kg=round(max(1.0, recommended_price), 2),
                    price_trend=trend,
                    demand_score=demand_score,
                    supply_score=supply_score,
                    future_prediction=future_prediction
                )
            except Exception as e:
                logger.error(f"Pricing ML model fit failed, falling back: {e}")
                return self._fallback_pricing(material_type)
        else:
            return self._fallback_pricing(material_type)

    def _fallback_pricing(self, material_type: str) -> PricingRecommendationResponse:
        """Deterministic pricing lookup fallback."""
        mat_lower = material_type.lower().strip()
        base_price = BASE_PRICES.get(mat_lower, 20.0)
        
        # Rule-based pricing predictions
        future_prediction = [
            {"month": "Month +1", "price": round(base_price * 1.03, 2)},
            {"month": "Month +2", "price": round(base_price * 1.05, 2)},
            {"month": "Month +3", "price": round(base_price * 1.08, 2)},
        ]
        
        return PricingRecommendationResponse(
            material_type=material_type,
            recommended_price_inr_per_kg=base_price,
            price_trend="STABLE",
            demand_score=6.5,
            supply_score=5.0,
            future_prediction=future_prediction
        )
