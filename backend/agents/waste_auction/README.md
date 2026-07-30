# Waste Auction Agent

## Purpose
Micro-agent coordinating live bid collection processes and leveraging **Google Gemini 1.5 Flash** to summarize bid timelines and estimate spot market premiums.

## Inputs
- `auction_id` (str)
- `material_type` (str)
- `quantity` (float)
- `reserve_price` (float)
- `time_limit_mins` (int)

## Outputs
- `winner` (str) - winning recycler bidder
- `winning_bid` (float) - final price in INR
- `bid_history` (list) - historical bid logs
- `average_bid` (float) - average bid in INR
- `outcome_summary` (str) - AI summary text

## API Endpoint
- `POST /api/waste-auction/bid`
- `GET /api/waste-auction/outcome/{auction_id}`

## Frontend Page
- `Waste Auction` (bidding countdown dials, active bid boards, and summary outcomes)
