# Circular Policy Advisor Agent

## Purpose
Analyze state and national environmental regulations and recommend compliance updates using **Google Gemini 1.5 Flash**.

## Inputs
- `company_profile` (str)
- `industry` (str)
- `location` (str)

## Outputs
- `policy_summary` (str)
- `regulatory_risks` (list)
- `recommended_changes` (list)
- `government_incentives` (list)
- `compliance_roadmap` (list)

## API Endpoint
- `POST /api/circular-policy`

## Frontend Page
- `CircularPolicyAdvisor.tsx`
