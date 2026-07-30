# Energy Optimization Agent

## Purpose
Monitor and forecast plant load levels and optimize operation schedules to lower peak demand tariffs using **XGBoost Regressor** models.

## Inputs
- `plant` (str)
- `equipment` (str)

## Outputs
- `energy_prediction` (float) - consumption forecast in kWh
- `recommended_schedule` (str) - load shift advisory text
- `energy_saving` (float) - load savings in kWh
- `peak_hours` (list) - tariff peak times list
- `cost_savings` (float) - savings in INR

## Dataset
- `energy_consumption.csv` compiling equipment power records.

## API Endpoint
- `GET /api/energy-optimization`

## Frontend Page
- `EnergyOptimization.tsx`
