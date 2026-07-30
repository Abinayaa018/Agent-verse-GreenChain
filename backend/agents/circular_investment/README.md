# Circular Investment Agent

## Purpose
Micro-agent rating and recommending recycling equipment purchases (AI sorters, balers, solar, sensors) using **Random Forest** ranking and **Google Gemini 1.5 Flash** advisory brief drafting.

## Inputs
- `company_name` (str)
- `budget_inr` (float)
- `primary_material` (str)

## Outputs
- `recommended_equipment` (str) - target machinery model
- `investment_cost` (float) - cost in INR
- `projected_roi` (float) - ROI percentage
- `co2_savings_kg` (float) - annual CO2 savings in kg
- `efficiency_gain` (float) - efficiency gain percentage
- `priority_score` (float) - score (0.0 to 10.0)
- `advisory_brief` (str) - AI brief text

## Dataset
- `equipment_investment_history.csv` compiling historical capital scores.

## API Endpoint
- `POST /api/circular-investment`

## Frontend Page
- `Circular Investment` (investment scorecards, equipment priorities list, and cost comparison graphs)
