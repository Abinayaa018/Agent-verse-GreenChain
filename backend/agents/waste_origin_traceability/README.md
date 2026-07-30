# Waste Origin Traceability Agent

## Purpose
Micro-agent tracking circular commodities checkpoints (generation, sorting, transit, processing, reuse) complete with **SHA256 consensus validation** and QR codes.

## Inputs
- `passport_id` (str)

## Outputs
- `passport_id` (str)
- `material_type` (str)
- `quantity` (float)
- `origin_city` (str)
- `checkpoints` (list) - chronological checkpoint items
- `verification_hash` (str) - consensus validation hash
- `qr_code_path` (str) - barcode PNG reference

## Dataset
- `traceability_registry.csv` compiling passport metadata.

## API Endpoint
- `GET /api/traceability/{passport_id}`
- `POST /api/traceability/checkpoint`

## Frontend Page
- `Waste Traceability` (timeline lists, QR code verification, consensus hash logs)
