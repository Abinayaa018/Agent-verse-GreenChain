# Circular Procurement Agent

## Purpose
Recommend recycled material suppliers using **Google Gemini 1.5 Flash**.

## Inputs
- `required_material` (str)
- `industry` (str)
- `budget` (float)
- `quality` (str)

## Outputs
- `recommended_suppliers` (list)
- `alternative_materials` (list)
- `cost_reduction_suggestions` (list)
- `sustainability_improvements` (list)
- `advisory_brief` (str)

## API Endpoint
- `POST /api/circular-procurement`

## Frontend Page
- `CircularProcurement.tsx`
