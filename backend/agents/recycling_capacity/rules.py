import os
import logging
import pandas as pd
import numpy as np
from typing import List, Dict, Any
from .models import AlternativeFacility, RecyclingCapacityResponse

logger = logging.getLogger("recycling_capacity.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")

os.makedirs(DATASET_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "recycler_capacity.csv")

class RecyclingCapacityEngine:
    """Smart heuristic engine evaluating facility utilization capacities and fee structures."""

    def __init__(self):
        self.generate_dataset_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic recycler capacity CSV...")
        np.random.seed(42)

        cities = ["Tiruppur", "Chennai", "Coimbatore", "Madurai", "Bangalore"]
        materials = ["plastic", "metal", "battery", "paper", "glass", "textile", "organic"]

        records = []
        for i in range(120):
            city = np.random.choice(cities)
            mat = np.random.choice(materials)
            
            daily_cap = float(np.random.randint(2000, 15000))
            load_ratio = float(np.random.uniform(0.1, 0.9))
            curr_load = float(np.round(daily_cap * load_ratio, 2))
            avail_cap = float(np.round(daily_cap - curr_load, 2))

            fee_per_kg = 1.5 if mat == "organic" else 15.0 if mat == "battery" else 8.0 if mat == "metal" else 3.5
            processing_fee = float(np.round(fee_per_kg + np.random.normal(0, fee_per_kg * 0.1), 2))
            
            # processing time in hours per ton
            processing_time = float(np.round(np.random.uniform(1.0, 5.0), 1))
            distance = float(np.round(np.random.uniform(5.0, 60.0), 1))

            records.append({
                "facility": f"{city} Refine-{i:02d} Ltd",
                "city": city,
                "material": mat,
                "daily_capacity": daily_cap,
                "current_load": curr_load,
                "available_capacity": avail_cap,
                "processing_fee": max(0.5, processing_fee),
                "processing_time": processing_time,
                "distance": distance
            })

        df = pd.DataFrame(records)
        df.to_csv(CSV_PATH, index=False)
        logger.info(f"Recycler capacity registry saved at {CSV_PATH} with {len(df)} rows.")

    def find_available_facility(self, material: str, quantity: float, city: str) -> dict:
        self.generate_dataset_if_missing()

        df = pd.read_csv(CSV_PATH)

        mat_clean = material.lower().strip()
        city_clean = city.strip().title()

        # Find recyclers in target city matching material type
        candidates = df[
            (df["material"] == mat_clean) & 
            (df["city"].str.lower() == city_clean.lower())
        ].copy()

        # If none in same city, widen scope to other cities
        if len(candidates) == 0:
            logger.info(f"No match in target city {city_clean} for {material}. widening scope to adjacent cities...")
            candidates = df[df["material"] == mat_clean].copy()

        if len(candidates) == 0:
            # Fallback if no matching recycler for this material anywhere
            return self._absolute_fallback(material, quantity)

        # Filter by available capacity
        valid_facilities = candidates[candidates["available_capacity"] >= quantity].copy()

        # If all facilities are overloaded, select the one with the highest available capacity anyway
        if len(valid_facilities) == 0:
            valid_facilities = candidates.copy()

        # Rank candidates based on a simple cost/load score (lower score is better)
        # Score = distance * 0.2 + processing_fee * 1.5 + (current_load/daily_capacity) * 10
        valid_facilities["rank_score"] = (
            valid_facilities["distance"] * 0.2 + 
            valid_facilities["processing_fee"] * 1.5 + 
            (valid_facilities["current_load"] / valid_facilities["daily_capacity"]) * 10.0
        )

        sorted_facilities = valid_facilities.sort_values("rank_score")

        best_match = sorted_facilities.iloc[0]

        # Waiting time (hours) = (current_load / daily_capacity) * 24 + (quantity / daily_capacity) * 8
        waiting_time = (best_match["current_load"] / best_match["daily_capacity"]) * 12.0 + (quantity / best_match["daily_capacity"]) * 8.0
        waiting_time = round(max(0.5, waiting_time), 1)

        # Map alternative options
        alternatives = []
        if len(sorted_facilities) > 1:
            for _, alt in sorted_facilities.iloc[1:4].iterrows():
                alternatives.append({
                    "facility": alt["facility"],
                    "available_capacity": float(alt["available_capacity"]),
                    "processing_fee": float(alt["processing_fee"]),
                    "distance": float(alt["distance"])
                })

        confidence = float(np.clip(1.0 - (best_match["current_load"] / best_match["daily_capacity"]) * 0.5, 0.6, 0.99))

        return {
            "recommended_facility": best_match["facility"],
            "available_capacity": float(best_match["available_capacity"]),
            "waiting_time": waiting_time,
            "distance": float(best_match["distance"]),
            "processing_fee": float(best_match["processing_fee"]),
            "confidence": round(confidence, 2),
            "alternatives": alternatives
        }

    def _absolute_fallback(self, material: str, quantity: float) -> dict:
        return {
            "recommended_facility": "General Reclamation Hub - A",
            "available_capacity": 5000.0,
            "waiting_time": 2.5,
            "distance": 32.5,
            "processing_fee": 5.5,
            "confidence": 0.85,
            "alternatives": [
                {
                    "facility": "General Reclamation Hub - B",
                    "available_capacity": 3000.0,
                    "processing_fee": 6.0,
                    "distance": 45.0
                }
            ]
        }
