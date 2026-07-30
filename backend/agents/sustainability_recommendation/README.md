# Sustainability Recommendation Agent

## Purpose
AI-powered advisor aggregating multi-agent operational metrics to query **Google Gemini 1.5 Flash** for personalized circular insights, cost optimizations, equipment upgrades, and roadmaps.

## Architecture
- uAgents framework integration
- Real-time LLM reasoning over platform context JSON vectors.

## Inputs
- `company_name` (str) - target company to evaluate

## Outputs
- `recommendations` (list) - detailed advisory steps
- `priority_actions` (list) - high priority actions
- `estimated_cost_savings` (float) - savings in INR
- `estimated_co2_reduction` (float) - CO2 savings in kg
- `roadmap` (list) - chronological roadmap
- `executive_summary` (str) - executive context summary

## LLM Model
- Google Gemini 1.5 Flash API (`gemini-1.5-flash`)

## API Endpoint
- `POST /api/sustainability-advisor`

## Frontend Page
- `Sustainability Advisor` (renders AI chat-style card recommendation items, roadmaps, and estimated savings highlights)
