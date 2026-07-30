# Supplier Reliability Agent

## Purpose
Predict supplier reliability before businesses choose suppliers.

## ML Model
- XGBoost Classifier (`reliability_class`: LOW, MEDIUM, HIGH)

## Dataset
- `supplier_history.csv` compiling transaction delay days, fulfilled rates, contract breaches, and ratings.

## API Endpoint
- `GET /api/supplier-reliability`

## Frontend Page
- `SupplierReliability.tsx`
