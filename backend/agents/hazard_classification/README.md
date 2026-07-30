# Hazard Classification Agent

## Purpose
Determine whether industrial waste is hazardous using **Google Gemini 1.5 Flash**.

## Inputs
- `material` (str)
- `chemical_composition` (str)
- `waste_description` (str)
- `msds_text` (str)

## Outputs
- `hazard_category` (str)
- `handling_procedures` (list)
- `ppe` (list)
- `storage` (str)
- `transport` (str)
- `disposal` (str)

## API Endpoint
- `POST /api/hazard-classification`

## Frontend Page
- `HazardClassification.tsx`
