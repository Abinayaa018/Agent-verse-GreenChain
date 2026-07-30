# Circular ROI Agent

## Purpose
Micro-agent forecasting Net Present Value (NPV), Internal Rate of Return (IRR), payback terms, and operational savings margins using a **Monte Carlo cash simulation** framework.

## Inputs
- `investment` (float)
- `equipment_cost` (float)
- `recycling_volume_kg` (float)
- `labor_hours_per_week` (float)
- `energy_savings_kwh` (float)

## Outputs
- `roi` (float) - ROI percentage
- `npv` (float) - net present value in INR
- `irr` (float) - internal rate of return percentage
- `payback_period` (float) - years to parity
- `annual_savings` (float) - yearly savings in INR
- `carbon_savings` (float) - yearly CO2 reduction in kg
- `profit_increase` (float) - net margin increase in INR

## Dataset
- `investment_roi_history.csv` compiling historical investment margins.

## API Endpoint
- `POST /api/circular-roi`

## Frontend Page
- `Circular ROI` (outlay forms, NPV curves, cash flow forecast histograms)
