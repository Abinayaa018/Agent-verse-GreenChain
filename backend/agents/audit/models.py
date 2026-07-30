from uagents import Model

class ESGReportInput(Model):
    company_name: str
    material_type: str
    quantity_kg: float
    contract_id: str

class ESGReportResult(Model):
    company_name: str
    report_period_transactions: int
    total_co2_saved_kg: float
    total_landfill_diverted_kg: float
    circularity_rating: str
    report_path: str