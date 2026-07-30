# Circular Design Agent

## Purpose
Suggest redesigns that improve product recyclability and circular economy options using **Google Gemini 1.5 Flash**.

## Inputs
- `product_type` (str)
- `material_composition` (str)
- `industry` (str)

## Outputs
- `material_substitutions` (list)
- `repairability_guidelines` (list)
- `recyclability_rating` (float)
- `design_improvements` (list)
- `reuse_opportunities` (list)
- `executive_summary` (str)

## API Endpoint
- `POST /api/circular-design`

## Frontend Page
- `CircularDesign.tsx`
