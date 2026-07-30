# Industrial Collaboration Agent

## Purpose
Micro-agent mapping regional factory nodes, discovering resource sharing and co-location synergies, and plotting relational supply link matrices.

## Outputs
- `nodes` (list) - Factory node roles and properties
- `links` (list) - Direct supply relationships
- `opportunities` (list) - Cost saving collaboration projects
- `expected_savings` (float) - aggregated savings in INR

## Dataset
- `industrial_synergies.csv` compiling factory facilities data.

## API Endpoint
- `GET /api/industrial-collaboration`

## Frontend Page
- `Industrial Collaboration` (relational graph maps, opportunity summaries, and expected savings metrics)
