# Recycling Capacity Agent

## Purpose
Capacity coordination agent that tracks current municipal recycling capacity loads, processing times, fees, and travel distances to recommend optimal facilities.

## Inputs
- `material` (str) - e.g., plastic, metal
- `quantity` (float) - quantity in kg
- `city` (str) - target processing city context

## Outputs
- `recommended_facility` (str) - recommended recycler facility
- `available_capacity` (float) - available daily capacity in kg
- `waiting_time` (float) - estimated processing wait time in hours
- `distance` (float) - travel distance in km
- `processing_fee` (float) - processing fee in INR/kg
- `confidence` (float) - matching score index
- `alternatives` (list) - secondary options list

## Datasets
- `recycler_capacity.csv` generated dynamically listing city facility profiles.

## API Endpoint
- `GET /api/recycling-capacity`

## Frontend Page
- `Recycler Capacity` (renders capacity charts, fee tables, and recommendation cards)
