# Insurance & Risk Assessment Agent

## Purpose
Micro-agent predicting transport, hazardous waste, and delay threats for waste cargo shipments using **Random Forest** and **XGBoost Regressors**, outputting insurance premium estimations.

## Inputs
- `material_type` (str)
- `quantity` (float)
- `distance` (float)
- `vehicle_type` (str)
- `season` (str)

## Outputs
- `risk_score` (float) - threat index (0.0 to 10.0)
- `insurance_recommendation` (str) - summary advice
- `premium_estimate` (float) - premium in INR
- `risk_category` (str) - LOW, MEDIUM, HIGH, CRITICAL
- `mitigation_suggestions` (list) - safety actions list

## Dataset
- `logistics_risk_history.csv` compiling historical shipment risk ratings.

## API Endpoint
- `POST /api/insurance-risk`

## Frontend Page
- `Insurance Risk` (risk dial cards, premium estimates, suggestions list, and historical comparison charts)
