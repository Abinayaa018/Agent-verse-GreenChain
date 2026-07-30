# Waste Prediction Agent

## Purpose
Intelligent predictive agent leveraging Random Forest Regression to forecast upcoming waste generation metrics for industrial enterprises.

## Inputs
- `company` (str) - target business identifier
- `industry` (str) - e.g., textiles, packaging
- `production_volume` (float) - estimated production metric

## Outputs
- `predicted_waste` (float) - predicted waste in kg
- `waste_categories` (dict) - categorical distribution in kg
- `next_month_prediction` (float) - subsequent month projection
- `confidence` (float) - model validation score

## ML Model
- Random Forest Regressor
Automatically trains and fits on historical logs, persisting variables using `joblib`.

## Dataset
- `company_waste_history.csv` listing industrial outputs, employee numbers, and seasons.

## API Endpoint
- `POST /api/predict-waste`

## Frontend Page
- `Waste Prediction` (form submissions, volume dials, category pies)
