# Fraud Detection Agent

## Purpose
Micro-agent leveraging Isolation Forest and Multi-Layer Perceptron (MLP) Autoencoder neural networks to audit transactions and identify irregular quantities, price gouging, duplicate smart contracts, or suspicious buyers/sellers.

## Architecture
- uAgents framework integration
- Unsupervised anomaly detection comparison (Isolation Forest vs Autoencoder reconstruction error)

## Inputs
- `transaction_id` (str) - target invoice key
- `buyer` (str) - buyer business name
- `seller` (str) - seller business name
- `material` (str) - commodity material type
- `quantity` (float) - commodity volume
- `price` (float) - pricing rate
- `distance` (float) - transit run in km
- `trust_score` (float) - entity credit trust score
- `payment_delay` (int) - days to invoice payment
- `duplicate_contract` (bool) - duplicate contract indicator

## Outputs
- `fraud_probability` (float) - 0.0 to 1.0 risk weight
- `risk_level` (str) - LOW, MEDIUM, HIGH, CRITICAL
- `fraud_reasons` (list) - suspicious triggers list
- `duplicate_detected` (bool) - duplicate status
- `recommended_action` (str) - audit action advice

## Dataset
- `transaction_history.csv` logging normal and injected fraud cases.

## ML Model
- Isolation Forest Anomaly model
- Multi-Layer Perceptron Autoencoder reconstruction model

## API Endpoint
- `POST /api/fraud-detection`

## Frontend Page
- `Fraud Detection` (renders risk levels dial, suspicious reasons details list, and audit trend charts)
