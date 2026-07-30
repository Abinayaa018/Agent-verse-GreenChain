import os
import json
import hashlib
import logging
from datetime import datetime
import pandas as pd
import numpy as np
from .models import TraceabilityRequest, TraceabilityResponse, CheckpointItem, CheckpointRequest

logger = logging.getLogger("waste_origin_traceability.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")

os.makedirs(DATASET_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "traceability_registry.csv")

class TraceabilityEngine:
    """Intelligent custody tracking engine managing material checkpoints and verification hashes."""

    def __init__(self):
        self.generate_dataset_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic material traceability registry CSV...")
        np.random.seed(42)

        cities = ["Tiruppur", "Coimbatore", "Chennai", "Salem", "Erode"]
        materials = ["plastic", "metal", "battery", "paper", "textile"]
        statuses = ["generated", "sorted", "transported", "processed", "recycled"]

        records = []
        for i in range(4500):
            pass_id = f"GC-PASS-{100000 + i}"
            mat = np.random.choice(materials)
            qty = float(np.random.uniform(50.0, 5000.0))
            city = np.random.choice(cities)
            status = np.random.choice(statuses)
            
            # Simple GPS mock
            gps = f"11.{np.random.randint(1000, 9000)}, 77.{np.random.randint(1000, 9000)}"
            
            sha = hashlib.sha256()
            sha.update(f"{pass_id}{mat}{qty}{city}".encode())
            v_hash = sha.hexdigest()

            records.append({
                "passport_id": pass_id,
                "material_type": mat,
                "quantity": round(qty, 1),
                "origin_city": city,
                "status": status,
                "last_checkpoint": f"{city} Sorting Plant",
                "last_gps": gps,
                "verification_hash": v_hash
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Traceability database saved at {CSV_PATH} with 4500 rows.")

    def get_passport_timeline(self, passport_id: str) -> dict:
        self.generate_dataset_if_missing()

        # Clean ID
        pass_clean = passport_id.upper().strip()

        df = pd.read_csv(CSV_PATH)
        row = df[df["passport_id"] == pass_clean]

        if len(row) > 0:
            match = row.iloc[0]
            mat = match["material_type"]
            qty = float(match["quantity"])
            city = match["origin_city"]
            v_hash = match["verification_hash"]
        else:
            # Fallback mocks if not found
            mat = "plastic"
            qty = 1500.0
            city = "Tiruppur"
            sha = hashlib.sha256()
            sha.update(f"{pass_clean}{mat}{qty}{city}".encode())
            v_hash = sha.hexdigest()

        # Build chronological checkpoints sequence
        checkpoints = [
            CheckpointItem(
                timestamp="2026-07-28 09:30:00",
                location=f"{city} Collection Hub",
                handler="Green Logistics Operator",
                status="generated",
                gps=f"11.0123, 77.2941"
            ),
            CheckpointItem(
                timestamp="2026-07-29 11:15:00",
                location=f"{city} Sorting Center",
                handler="Salem Scrap Yard Operator",
                status="sorted",
                gps=f"11.3852, 77.4091"
            ),
            CheckpointItem(
                timestamp="2026-07-30 14:00:00",
                location="Coimbatore Recycling Hub",
                handler="Coimbatore E-Hub Operator",
                status="processed",
                gps=f"11.0168, 76.9558"
            )
        ]

        return {
            "passport_id": pass_clean,
            "material_type": mat,
            "quantity": qty,
            "origin_city": city,
            "checkpoints": [c.dict() for c in checkpoints],
            "verification_hash": v_hash,
            "qr_code_path": f"/reports/qr_{pass_clean}.png"
        }

    def add_custody_checkpoint(self, req: CheckpointRequest) -> dict:
        self.generate_dataset_if_missing()

        # Retrieve current timeline
        timeline = self.get_passport_timeline(req.passport_id)
        
        # Append new checkpoint
        new_c = CheckpointItem(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            location=req.location,
            handler=req.handler,
            status=req.status,
            gps="11.0168, 76.9558"
        )
        
        timeline["checkpoints"].append(new_c.dict())
        return timeline
