# Workforce Optimization Agent

## Purpose
Optimize factory shift headcount allocations and forecast productivity targets using **Random Forest Regressor** models.

## Inputs
- `plant` (str)

## Outputs
- `staff_allocation` (dict) - shift mapping headcounts
- `recommended_shifts` (list) - planning actions guides
- `productivity_forecast` (float) - projected output factor
- `idle_workforce` (float) - headcount redundant workers

## Dataset
- `employee_shift_data.csv` tracking attendance rates, overtime hours, and machine downtimes.

## API Endpoint
- `GET /api/workforce-optimization`

## Frontend Page
- `WorkforceOptimization.tsx`
