# Negotiation Agent

## Purpose
Micro-agent leveraging **Google Gemini 1.5 Flash** to conduct commercial negotiations (pricing, MOQ, payment/delivery clauses) and evaluate deal acceptance levels.

## Inputs
- `buyer` (str)
- `seller` (str)
- `material` (str)
- `quantity` (float)
- `target_price` (float)
- `urgency` (str)

## Outputs
- `transcript` (list) - conversational round history
- `final_price` (float) - final settled rate
- `savings` (float) - cost difference saved
- `acceptance_probability` (float) - probability of agreement
- `negotiation_score` (float) - score ranking the deal

## Dataset
- `negotiation_history.csv` compiling transaction bargaining trends.

## API Endpoint
- `POST /api/negotiate`

## Frontend Page
- `Negotiation` (dialogue bubble transcripts and KPIs)
