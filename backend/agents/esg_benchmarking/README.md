# ESG Benchmarking Agent

## Purpose
Intelligent benchmarking agent comparing corporate metrics (CO2 savings, circularity indexes, landfill diversion, and recycling rates) against industry, state, and national averages.

## Inputs
- `company_name` (str) - target company to evaluate

## Outputs
- `industry_rank` (int) - sector ranking index
- `state_rank` (int) - state regional ranking index
- `national_rank` (int) - national ranking index
- `industry_average` (dict) - average performance indexes
- `company_score` (dict) - target company scores
- `benchmark_gap` (dict) - difference comparison weights
- `recommendations` (list) - improvement recommendations

## Dataset
- `industry_esg.csv` compiling national averages.

## API Endpoint
- `GET /api/esg-benchmark`

## Frontend Page
- `ESG Benchmark` (renders radar performance charts, state/national rank cards, progress bars comparison, and gaps advisory summaries)
