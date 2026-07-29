from uagents import Model

class MarketplaceInput(Model):
    material_type: str
    quantity_kg: float
    seller_name: str
    buyer_name: str
    proposed_price_inr: float

class TransactionRecord(Model):
    contract_id: str
    material_type: str
    quantity_kg: float
    seller_name: str
    buyer_name: str
    final_price_inr: float
    status: str
    combined_trust_score: float
    notes: str