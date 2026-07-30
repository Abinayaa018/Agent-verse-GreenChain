# Demand Forecasting Agent

## Purpose
Autonomous predictive micro-agent designed to analyze historical marketplace trends and forecast future demand indexes and commodity price values.

## Inputs
- `material` (str) - e.g., plastic, metal
- `industry` (str) - e.g., packaging, construction

## Outputs
- `demand_score` (float) - 1.0 to 10.0
- `predicted_price` (float) - INR/kg
- `next_month_demand` (float) - quantity in tons
- `trend` (str) - UPWARD, DOWNWARD, STABLE
- `confidence` (float) - validation accuracy metric
- `inventory_recommendation` (str) - text advisory

## ML Models
- Prophet
- XGBoost Regressor
The rules engine trains both models, validates them, and persists the model with the lower validation Mean Absolute Error.

## Dataset
- `historical_market_data.csv` containing date, material, industry, quantity, price, month, season, and demand index records.

## API Endpoint
- `GET /api/demand-forecast`

## Frontend Page
- `Demand Forecast` (renders forecast charts, trend gauges, and score metrics)
