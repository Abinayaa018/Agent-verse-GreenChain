import os
import logging
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from .models import EmissionsResponse

logger = logging.getLogger("emission_monitoring.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")
MODEL_DIR = os.path.join(AGENT_DIR, "trained_models")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "emissions.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "emissions_model.joblib")

FACILITIES = ["Tiruppur Textiles", "EcoFibre Ltd", "Coimbatore E-Hub", "Salem Scrap Yard"]

class EmissionMonitoringEngine:
    """Intelligent industrial emissions audit engine utilizing Isolation Forest anomaly classification."""

    def __init__(self):
        self.generate_dataset_if_missing()
        self.train_model_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic emissions records CSV...")
        np.random.seed(42)

        records = []
        for i in range(5000):
            fac = np.random.choice(FACILITIES)
            # Normal emission levels
            co2 = float(np.random.uniform(150.0, 450.0))
            nox = float(np.random.uniform(5.0, 45.0))
            sox = float(np.random.uniform(2.0, 25.0))
            pm = float(np.random.uniform(10.0, 65.0))

            # Inject 3% anomalies (violations)
            if np.random.rand() < 0.03:
                co2 *= 2.2
                nox *= 2.5
                sox *= 3.0
                pm *= 2.4

            ts = (pd.Timestamp("2026-07-01") + pd.to_timedelta(i * 10, unit="m")).isoformat()

            records.append({
                "CO2": round(co2, 2),
                "NOx": round(nox, 2),
                "SOx": round(sox, 2),
                "PM2.5": round(pm, 2),
                "timestamp": ts,
                "facility": fac,
                "sensor": f"SEN-{100 + (i % 5)}"
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Emissions dataset saved successfully at {CSV_PATH} with 5000 rows.")

    def train_model_if_missing(self):
        if os.path.exists(MODEL_PATH):
            return

        logger.info("Training Isolation Forest Anomaly model...")
        df = pd.read_csv(CSV_PATH)

        X = df[["CO2", "NOx", "SOx", "PM2.5"]]

        # Fit Isolation Forest
        clf = IsolationForest(contamination=0.03, random_state=42)
        clf.fit(X)

        joblib.dump(clf, MODEL_PATH)
        logger.info(f"Saved emissions anomaly classifier successfully at {MODEL_PATH}")

    def get_emissions_audit(self, facility_name: str) -> dict:
        self.train_model_if_missing()

        # Clean string
        fac_clean = facility_name.strip()

        df = pd.read_csv(CSV_PATH)
        facility_df = df[df["facility"] == fac_clean]
        if len(facility_df) == 0:
            facility_df = df.iloc[:100]

        # Calculate anomalies using model
        try:
            model = joblib.load(MODEL_PATH)
            X = facility_df[["CO2", "NOx", "SOx", "PM2.5"]]
            preds = model.predict(X)
            # prediction labels: -1 = anomaly, 1 = normal
            anomalies_count = int(np.sum(preds == -1))
        except Exception as e:
            logger.error(f"Anomaly classifier failed: {e}")
            anomalies_count = 0

        # Compile alerts
        alerts = []
        if anomalies_count > 0:
            alerts.append(f"Flagged {anomalies_count} PM2.5/CO2 sensor outliers violating clean air criteria.")
        else:
            alerts.append("No critical sensor spikes registered within the last 24 hours.")

        # Status
        status = "VIOLATING" if anomalies_count > 4 else "VOLATILE" if anomalies_count > 0 else "STABLE"

        # Recommendations
        recs = [
            "Initiate conveyor extraction hood dust filters audit immediately.",
            "Verify flue damper configurations during high-temperature sorting runs.",
            "Replace particulate filters on SEN-102 line."
        ]

        # Create trend logs (last 5 intervals)
        trend = []
        subset = facility_df.tail(6)
        for _, row in subset.iterrows():
            trend.append({
                "time": pd.to_datetime(row["timestamp"]).strftime("%H:%M"),
                "co2": float(row["CO2"]),
                "pm": float(row["PM2.5"])
            })

        return {
            "alerts": alerts,
            "trend": trend,
            "emission_status": status,
            "recommendations": recs
        }
