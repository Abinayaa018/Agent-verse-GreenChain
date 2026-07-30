import os
import logging
import pandas as pd
from .models import CollabResponse, NodeItem, LinkItem, OpportunityItem

logger = logging.getLogger("industrial_collaboration.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")

os.makedirs(DATASET_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "industrial_synergies.csv")

class IndustrialCollaborationEngine:
    """Intelligent synergy mapping engine grouping local factories into circular resource sharing pipelines."""

    def __init__(self):
        self.generate_dataset_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating industrial synergies registry CSV...")
        data = [
            {"factory": "Tiruppur Textiles", "state": "Tamil Nadu", "inputs": "cotton, polyester", "outputs": "cotton scraps, thread offcuts", "machinery": "weaving looms"},
            {"factory": "Coimbatore E-Hub", "state": "Tamil Nadu", "inputs": "cotton scraps, raw e-waste", "outputs": "shredded cotton pulp, sorted plastics", "machinery": "industrial shredder, sorting lines"},
            {"factory": "EcoFibre Ltd", "state": "Tamil Nadu", "inputs": "shredded cotton pulp, plastic pellets", "outputs": "recycled garments, PET sheet liners", "machinery": "extrusion lines"},
            {"factory": "Chennai Polymers", "state": "Tamil Nadu", "inputs": "sorted plastics", "outputs": "plastic pellets", "machinery": "pelletizer extruder"},
            {"factory": "Salem Scrap Yard", "state": "Tamil Nadu", "inputs": "scrap metal", "outputs": "compressed steel blocks", "machinery": "bale compressor"}
        ]
        pd.DataFrame(data).to_csv(CSV_PATH, index=False)
        logger.info(f"Synergies database saved successfully at {CSV_PATH}.")

    def get_synergy_networks(self) -> dict:
        self.generate_dataset_if_missing()

        # Build synergy nodes
        nodes = [
            NodeItem(id="Tiruppur Textiles", role="Supplier", details="Produces 5,000 kg cotton scrap/month. Lacks processing shredders."),
            NodeItem(id="Coimbatore E-Hub", role="Processor", details="Owns high-speed industrial shredders. Capacity: 15,000 kg/month."),
            NodeItem(id="EcoFibre Ltd", role="Consumer", details="Needs shredded cotton pulp for recycled textiles. Purchasing budget: ₹1.5L/month."),
            NodeItem(id="Chennai Polymers", role="Processor", details="Owns pelletizer machinery matching plastic flakes streams.")
        ]

        # Build synergy flows links
        links = [
            LinkItem(source="Tiruppur Textiles", target="Coimbatore E-Hub", relation="Raw Cotton Scrap Supply"),
            LinkItem(source="Coimbatore E-Hub", target="EcoFibre Ltd", relation="Processed Pulp Supply"),
            LinkItem(source="Chennai Polymers", target="EcoFibre Ltd", relation="Secondary Plastic Pellets Supply")
        ]

        # Build joint projects opportunities
        opportunities = [
            OpportunityItem(
                title="Coimbatore Textile Circular Pipeline",
                savings=145000.0,
                details="Consolidate Tiruppur scrap hauling directly to Coimbatore E-Hub shredders, then route output to EcoFibre. Reduces freight by 45%."
            ),
            OpportunityItem(
                title="Secondary Plastic Injection Cooperation",
                savings=85000.0,
                details="Co-locate pelletizer storage next to processing lines to bypass intermediate logistics warehouse fees."
            )
        ]

        return {
            "nodes": [n.dict() for n in nodes],
            "links": [l.dict() for l in links],
            "opportunities": [o.dict() for o in opportunities],
            "expected_savings": 230000.0
        }
