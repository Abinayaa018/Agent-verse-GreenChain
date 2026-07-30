# Facility Expansion Agent

## Purpose
Recommend optimal geographic locations for establishing new regional recycling plants using **XGBoost Regressor** models.

## Outputs
- `recommended_city` (str) - highest ROI city option
- `roi` (float) - ROI percentage forecast
- `expected_throughput` (float) - annual waste capacity in metric tons
- `environmental_benefit` (str) - diversion benefits summary statement

## Dataset
- `regional_waste_generation.csv` compiling land price indices, industrial volume density, and recycling counts.

## API Endpoint
- `GET /api/facility-expansion`

## Frontend Page
- `FacilityExpansion.tsx`
