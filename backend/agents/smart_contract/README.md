# Smart Contract Agent

## Purpose
Micro-agent automatically compiling transaction clauses and compiling certified transaction agreement PDFs complete with **SHA256 digital signature hashes**.

## Inputs
- `buyer` (str)
- `seller` (str)
- `material` (str)
- `quantity` (float)
- `price` (float)
- `delivery_clause` (str)
- `payment_clause` (str)
- `penalty_clause` (str)

## Outputs
- `contract_id` (str) - contract Reference
- `pdf_filename` (str) - contract PDF filename
- `contract_json` (str) - stringified metadata
- `signature_hash` (str) - SHA256 digital verification hash
- `version` (int) - iteration index

## API Endpoint
- `POST /api/smart-contract/generate`
- `GET /api/smart-contract/download/{contract_id}`

## Frontend Page
- `Smart Contract` (drafting panel, signature hash checks, and PDF download links)
