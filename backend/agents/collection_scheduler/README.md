# Collection Scheduler Agent

## Purpose
Logistics scheduling agent that coordinates vehicle payload weight limits, driver shifts, and recycling receiver availability to schedule collection runs.

## Inputs
- `material` (str) - e.g., plastic, metal
- `quantity` (float) - quantity in kg
- `city` (str) - pickup city location
- `urgency` (str) - urgency class: high, medium, low

## Outputs
- `pickup_time` (str) - formatted ISO scheduled slot
- `driver` (str) - assigned driver name
- `vehicle` (str) - assigned vehicle registry
- `ETA` (str) - time to arrival
- `optimized_route` (list) - route transit nodes
- `recycler` (str) - target processing recycler

## Optimization Logic
- Computes best matching driver and vehicle by capacity limit checking and city matching checks.

## Datasets
- `vehicles.csv`, `drivers.csv`, `pickup_requests.csv` generated dynamically.

## API Endpoint
- `POST /api/schedule-pickup`

## Frontend Page
- `Collection Scheduler` (pickup timelines, assignments, and routes display)
