# Circular Supply Risk Agent

## Purpose
Micro-agent forecasting commodity supply disruptions and regional raw recycling shortages using **XGBoost time-series** regressor projections.

## Inputs
- `material` (str)

## Outputs
- `supply_risk_index` (float) - risk rating (0.0 to 10.0)
- `scarcity_score` (float) - scarcity index (0.0 to 10.0)
- `alternative_suppliers` (list) - alternate suppliers list
- `risk_timeline` (list) - 6-month monthly projections

## Dataset
- `material_supply_history.csv` compiling material scarcity records.

## API Endpoint
- `GET /api/supply-risk?material={material}`

## Frontend Page
- `Supply Risk` (risk timelines, alternate suppliers charts, and scarcity index gauges)
