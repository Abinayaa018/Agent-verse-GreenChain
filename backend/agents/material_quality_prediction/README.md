# Material Quality Prediction Agent

## Purpose
Intelligent predictive agent evaluating commodity quality post-storage using ambient humidity, storage days, and logistics distance parameters.

## Architecture
- uAgents framework registration
- XGBoost & Random Forest regression pipeline selection

## Inputs
- `material_type` (str) - e.g., plastic, metal
- `industry` (str) - e.g., packaging, textiles
- `storage_days` (int) - storage warehouse days
- `humidity` (float) - humidity percentage
- `transport_distance` (float) - travel distance in km

## Outputs
- `quality_score` (float) - 1.0 to 10.0 quality scale
- `predicted_moisture` (float) - moisture percentage
- `predicted_contamination` (float) - contamination percentage
- `degradation_risk` (str) - LOW, MEDIUM, HIGH
- `resale_grade` (str) - Grade-A, Grade-B, Grade-C, Grade-D
- `confidence` (float) - R2 validation metric

## Dataset
- `material_quality_history.csv` listing storage, moisture, and quality scores.

## ML Model
- XGBoost Regressor
- Random Forest Regressor

## API Endpoint
- `POST /api/material-quality`

## Frontend Page
- `Material Quality` (renders quality dial, metrics details, and quality metrics history graphs)
