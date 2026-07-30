# Emission Monitoring Agent

## Purpose
Monitor industrial emissions, detect anomalies, calculate trend, and predict violations using **Isolation Forest** unsupervised anomaly classification models.

## Inputs
- `facility` (str)

## Outputs
- `alerts` (list)
- `trend` (list of timestamps & emission levels)
- `emission_status` (str)
- `recommendations` (list)

## Dataset
- `emissions.csv` compiling telemetry metrics.

## API Endpoint
- `GET /api/emissions`

## Frontend Page
- `EmissionMonitoring.tsx`
