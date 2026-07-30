import os
import logging
import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from .models import SchedulePickupRequest, SchedulePickupResponse

logger = logging.getLogger("collection_scheduler.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")

os.makedirs(DATASET_DIR, exist_ok=True)

VEHICLES_CSV = os.path.join(DATASET_DIR, "vehicles.csv")
DRIVERS_CSV = os.path.join(DATASET_DIR, "drivers.csv")
REQUESTS_CSV = os.path.join(DATASET_DIR, "pickup_requests.csv")

class CollectionSchedulingEngine:
    """Smart heuristic optimization engine for assigning logistics resources and calculating pickup routes."""

    def __init__(self):
        self.generate_datasets_if_missing()

    def generate_datasets_if_missing(self):
        # 1. Vehicles
        if not os.path.exists(VEHICLES_CSV):
            logger.info("Generating vehicles database CSV...")
            np.random.seed(42)
            cities = ["Tiruppur", "Chennai", "Coimbatore", "Madurai", "Bangalore"]
            types = ["Heavy Duty Dump", "Electric Box Truck", "Flatbed Carrier", "Compact Logistics Van"]
            
            records = []
            for i in range(150):
                v_type = np.random.choice(types)
                capacity = 5000 if "Heavy" in v_type else 3000 if "Electric" in v_type else 4000 if "Flatbed" in v_type else 1200
                records.append({
                    "vehicle_id": f"TN-{np.random.randint(10, 99)}-{chr(np.random.randint(65, 91))}{chr(np.random.randint(65, 91))}-{np.random.randint(1000, 9999)}",
                    "type": v_type,
                    "capacity_kg": capacity,
                    "status": np.random.choice(["Available", "Active", "Maintenance"], p=[0.6, 0.3, 0.1]),
                    "city": np.random.choice(cities)
                })
            pd.DataFrame(records).to_csv(VEHICLES_CSV, index=False)

        # 2. Drivers
        if not os.path.exists(DRIVERS_CSV):
            logger.info("Generating drivers database CSV...")
            np.random.seed(42)
            cities = ["Tiruppur", "Chennai", "Coimbatore", "Madurai", "Bangalore"]
            names = ["Arun Kumar", "Vijay Ram", "Senthil Mani", "Karthik Raja", "Rajesh Sekar", "Manoj Chandran", "Prakash Dev", "Suresh Balaji"]
            
            records = []
            for i in range(100):
                records.append({
                    "driver_id": f"GC-DRV-{i:03d}",
                    "name": np.random.choice(names) + f" {chr(np.random.randint(65, 91))}.",
                    "status": np.random.choice(["Available", "On Duty", "Off Duty"], p=[0.7, 0.2, 0.1]),
                    "city": np.random.choice(cities)
                })
            pd.DataFrame(records).to_csv(DRIVERS_CSV, index=False)

        # 3. Pickup Requests log
        if not os.path.exists(REQUESTS_CSV):
            logger.info("Generating pickup requests registry CSV...")
            np.random.seed(42)
            cities = ["Tiruppur", "Chennai", "Coimbatore", "Madurai", "Bangalore"]
            companies = ["Tiruppur Textiles", "EcoFibre Ltd", "Electro-Recycle", "Kovai Paper Mills"]
            materials = ["plastic", "metal", "battery", "paper", "textile"]

            records = []
            for i in range(120):
                records.append({
                    "request_id": f"GC-PK-{uuid.uuid4().hex[:6].upper()}",
                    "company": np.random.choice(companies),
                    "material": np.random.choice(materials),
                    "quantity_kg": float(np.random.randint(500, 4800)),
                    "urgency": np.random.choice(["high", "medium", "low"], p=[0.2, 0.5, 0.3]),
                    "status": "Completed",
                    "timestamp": (datetime.now(timezone.utc) - timedelta(days=np.random.randint(1, 30))).isoformat(),
                    "city": np.random.choice(cities)
                })
            pd.DataFrame(records).to_csv(REQUESTS_CSV, index=False)

    def schedule_pickup(self, req: SchedulePickupRequest) -> SchedulePickupResponse:
        self.generate_datasets_if_missing()

        # Load databases
        v_df = pd.read_csv(VEHICLES_CSV)
        d_df = pd.read_csv(DRIVERS_CSV)

        city_clean = req.city.strip().title()

        # Find matching vehicles: Available, same city, capacity >= quantity
        matched_vehicles = v_df[
            (v_df["city"].str.lower() == city_clean.lower()) & 
            (v_df["status"] == "Available") & 
            (v_df["capacity_kg"] >= req.quantity)
        ]

        if len(matched_vehicles) > 0:
            # Choose the one with the smallest compatible capacity to optimize utilization
            selected_v = matched_vehicles.sort_values("capacity_kg").iloc[0]
            vehicle_id = f"{selected_v['type']} ({selected_v['vehicle_id']})"
        else:
            # Fallback to any available vehicle in same city or generic truck
            any_v = v_df[(v_df["city"].str.lower() == city_clean.lower()) & (v_df["status"] == "Available")]
            if len(any_v) > 0:
                selected_v = any_v.iloc[0]
                vehicle_id = f"{selected_v['type']} ({selected_v['vehicle_id']})"
            else:
                vehicle_id = "Heavy Duty Dump (TN-37-AZ-8902)"

        # Find available driver
        matched_drivers = d_df[
            (d_df["city"].str.lower() == city_clean.lower()) & 
            (d_df["status"] == "Available")
        ]

        if len(matched_drivers) > 0:
            driver_name = matched_drivers.iloc[0]["name"]
        else:
            driver_name = "Ramanujam S."

        # Assign Recycler based on city
        recyclers = {
            "Tiruppur": "Tiruppur Green Recyclers",
            "Chennai": "Chennai Eco-Hub Recycling",
            "Coimbatore": "Kovai Circular Park",
            "Madurai": "Pandyan Eco Solutions",
            "Bangalore": "Bengaluru E-Waste Reclamation"
        }
        recycler = recyclers.get(city_clean, f"{city_clean} Municipal Processing Facility")

        # ETA calculations based on urgency
        urgency_lower = req.urgency.lower().strip()
        if urgency_lower == "high":
            eta = "2 Hours"
            pickup_dt = datetime.now() + timedelta(hours=2)
        elif urgency_lower == "medium":
            eta = "6 Hours"
            pickup_dt = datetime.now() + timedelta(hours=6)
        else:
            eta = "24 Hours"
            pickup_dt = datetime.now() + timedelta(days=1)

        pickup_time = pickup_dt.strftime("%Y-%m-%d %H:%M UTC")

        # Route waypoints optimization
        optimized_route = [
            f"Pickup Point: {req.company}",
            f"{city_clean} Municipal Weighbridge",
            f"Terminal Hub: {recycler}"
        ]

        # Log request to CSV database
        new_record = {
            "request_id": f"GC-PK-{uuid.uuid4().hex[:6].upper()}",
            "company": req.company,
            "material": req.material,
            "quantity_kg": req.quantity,
            "urgency": req.urgency,
            "status": "Scheduled",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "city": req.city
        }
        
        try:
            r_df = pd.read_csv(REQUESTS_CSV)
            r_df = pd.concat([r_df, pd.DataFrame([new_record])], ignore_index=True)
            r_df.to_csv(REQUESTS_CSV, index=False)
        except Exception as e:
            logger.error(f"Failed to append pickup request logs: {e}")

        return SchedulePickupResponse(
            pickup_time=pickup_time,
            driver=driver_name,
            vehicle=vehicle_id,
            ETA=eta,
            optimized_route=optimized_route,
            recycler=recycler
        )
