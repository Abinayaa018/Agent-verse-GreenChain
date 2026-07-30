# Sustainability Reputation Agent

## Purpose
Micro-agent aggregating operational ratings (compliance records, carbon ledger volumes, marketplace trust metrics) to calculate a corporate public Sustainability Reputation Index.

## Outputs
- `reputation_index` (float) - corporate score (0.0 to 100.0)
- `industry_rank` (int) - sector circularity standing rank
- `badges` (list) - reputation awards list
- `public_profile_summary` (str) - corporate brand summary
- `improvement_suggestions` (list) - improvement recommendations

## Dataset
- `company_reputation_index.csv` compiling corporate ESG metrics.

## API Endpoint
- `GET /api/sustainability-reputation?company_name={company_name}`

## Frontend Page
- `Reputation Profile` (reputation dial scores, public profiles summary, badges, and progress bar audits)
