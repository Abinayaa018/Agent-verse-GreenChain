# Resource Availability Agent

## Purpose
Monitor regional recyclable resource availability and project shortages using **Random Forest Regressor** models.

## Inputs
- `city` (str)
- `material` (str)

## Outputs
- `availability` (float) - available quantity in metric tons
- `shortage_risk` (str) - shortage risk category (STABLE, LOW_RISK, CRITICAL)
- `surplus` (float) - local surplus in metric tons
- `future_availability` (float) - next month availability prediction in metric tons

## Dataset
- `regional_resources.csv` compiling imports, exports, capacity, and current volumes.

## API Endpoint
- `GET /api/resource-availability`

## Frontend Page
- `ResourceAvailability.tsx`
