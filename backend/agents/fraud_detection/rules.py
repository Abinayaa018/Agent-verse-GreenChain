import os
import logging
import pandas as pd
import numpy as np
import joblib
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from .models import FraudDetectionRequest, FraudDetectionResponse

logger = logging.getLogger("fraud_detection.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")
MODEL_DIR = os.path.join(AGENT_DIR, "trained_models")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "transaction_history.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "fraud_detector_model.joblib")

BUYERS = ["Tiruppur Textiles", "EcoFibre Ltd", "Electro-Recycle", "Kovai Paper Mills"]
SELLERS = ["Chennai Polymers", "Salem Steel", "Coimbatore E-Hub", "Salem Scrap Yard"]
MATERIALS = ["plastic", "metal", "battery", "paper", "textile"]

class FraudDetectionEngine:
    """Intelligent fraud detection engine validating transactions using unsupervised learning."""

    def __init__(self):
        self.generate_dataset_if_missing()
        self.train_model_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic transaction history CSV for fraud detection...")
        np.random.seed(42)

        base_prices = {"plastic": 20, "metal": 100, "battery": 140, "paper": 10, "textile": 12}

        records = []
        for i in range(5000):
            tx_id = f"TX-{100000 + i}"
            buyer = np.random.choice(BUYERS)
            seller = np.random.choice(SELLERS)
            mat = np.random.choice(MATERIALS)
            
            qty = float(np.random.uniform(100.0, 8000.0))
            base_price = base_prices.get(mat, 25)
            price = float(np.round(base_price + np.random.normal(0, base_price * 0.1), 2))
            
            distance = float(np.round(np.random.uniform(5.0, 450.0), 1))
            trust_score = float(np.round(np.random.uniform(4.0, 9.9), 1))
            payment_delay = int(np.random.randint(1, 28))
            duplicate_contract = False

            # Inject synthetic fraudulent patterns (~5% total fraud rate)
            fraud_label = 0
            fraud_type = np.random.choice(["none", "duplicate", "price_spike", "low_trust", "payment_delay_fraud"], p=[0.95, 0.01, 0.015, 0.015, 0.01])
            
            if fraud_type == "duplicate":
                duplicate_contract = True
                fraud_label = 1
            elif fraud_type == "price_spike":
                price = float(np.round(base_price * np.random.uniform(3.5, 6.0), 2))
                fraud_label = 1
            elif fraud_type == "low_trust":
                trust_score = float(np.round(np.random.uniform(0.5, 1.8), 1))
                fraud_label = 1
            elif fraud_type == "payment_delay_fraud":
                payment_delay = int(np.random.randint(45, 90))
                fraud_label = 1

            records.append({
                "transaction_id": tx_id,
                "buyer": buyer,
                "seller": seller,
                "material": mat,
                "quantity": round(qty, 2),
                "price": price,
                "timestamp": (datetime.now() - timedelta(days=np.random.randint(1, 120))).isoformat(),
                "distance": distance,
                "trust_score": trust_score,
                "payment_delay": payment_delay,
                "duplicate_contract": duplicate_contract,
                "fraud_label": fraud_label
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Transaction dataset saved at {CSV_PATH} with 5000 rows.")

    def train_model_if_missing(self):
        if os.path.exists(MODEL_PATH):
            return

        logger.info("Training Fraud Detection Unsupervised Classifier...")
        df = pd.read_csv(CSV_PATH)

        # Vectorize features
        df["buyer_idx"] = df["buyer"].apply(lambda x: BUYERS.index(x) if x in BUYERS else -1)
        df["seller_idx"] = df["seller"].apply(lambda x: SELLERS.index(x) if x in SELLERS else -1)
        df["material_idx"] = df["material"].apply(lambda x: MATERIALS.index(x) if x in MATERIALS else -1)

        feature_cols = ["buyer_idx", "seller_idx", "material_idx", "quantity", "price", "distance", "trust_score", "payment_delay", "duplicate_contract"]
        X = df[feature_cols].copy()
        
        # Normalize features
        mean_std = {}
        for col in feature_cols:
            mean = float(X[col].mean())
            std = float(X[col].std()) if X[col].std() > 0 else 1.0
            X[col] = (X[col] - mean) / std
            mean_std[col] = {"mean": mean, "std": std}

        y = df["fraud_label"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

        # 1. Isolation Forest
        isf = IsolationForest(contamination=0.05, random_state=42)
        isf.fit(X_train)
        
        # Anomaly scores (lower is more anomalous, so convert to 0..1 scale)
        isf_scores = -isf.score_samples(X_test)
        isf_preds = (isf_scores > 0.55).astype(int)
        isf_f1 = f1_score(y_test, isf_preds)
        logger.info(f"Isolation Forest F1 score: {isf_f1:.4f}")

        # 2. MLP Autoencoder
        # Fits X to X to minimize reconstruction loss
        ae = MLPRegressor(hidden_layer_sizes=(8, 4, 8), activation="relu", solver="adam", max_iter=100, random_state=42)
        ae.fit(X_train, X_train)
        
        ae_reconst = ae.predict(X_test)
        ae_loss = np.mean((X_test - ae_reconst) ** 2, axis=1)
        ae_preds = (ae_loss > 0.8).astype(int)
        ae_f1 = f1_score(y_test, ae_preds)
        logger.info(f"Autoencoder F1 score: {ae_f1:.4f}")

        # Choose winner
        if isf_f1 >= ae_f1:
            best_model = isf
            model_type = "isolation_forest"
            best_f1 = isf_f1
            threshold = 0.55
        else:
            best_model = ae
            model_type = "autoencoder"
            best_f1 = ae_f1
            threshold = 0.8

        meta = {
            "model": best_model,
            "model_type": model_type,
            "mean_std": mean_std,
            "threshold": threshold,
            "f1_score": float(best_f1),
            "feature_cols": feature_cols
        }
        joblib.dump(meta, MODEL_PATH)
        logger.info(f"Saved winner ({model_type}) with validation F1: {best_f1:.2f}")

    def detect_fraud(self, req: FraudDetectionRequest) -> dict:
        self.train_model_if_missing()

        # Load models
        try:
            meta = joblib.load(MODEL_PATH)
            model = meta["model"]
            model_type = meta["model_type"]
            mean_std = meta["mean_std"]
            threshold = meta["threshold"]
        except Exception as e:
            logger.error(f"Failed to load fraud model: {e}")
            return self._fallback_fraud_check(req)

        # Category mapping
        b_idx = BUYERS.index(req.buyer) if req.buyer in BUYERS else -1
        s_idx = SELLERS.index(req.seller) if req.seller in SELLERS else -1
        m_idx = MATERIALS.index(req.material) if req.material in MATERIALS else -1

        input_raw = {
            "buyer_idx": b_idx,
            "seller_idx": s_idx,
            "material_idx": m_idx,
            "quantity": req.quantity,
            "price": req.price,
            "distance": req.distance,
            "trust_score": req.trust_score,
            "payment_delay": req.payment_delay,
            "duplicate_contract": float(req.duplicate_contract)
        }

        # Normalize features using saved scaler values
        input_norm = {}
        for col in meta["feature_cols"]:
            mean = mean_std[col]["mean"]
            std = mean_std[col]["std"]
            input_norm[col] = (input_raw[col] - mean) / std

        input_df = pd.DataFrame([input_norm])

        # Compute anomaly score
        if model_type == "isolation_forest":
            score = float(-model.score_samples(input_df)[0])
            fraud_prob = float(np.clip((score - 0.3) / 0.5, 0.0, 1.0))
        else: # Autoencoder
            reconst = model.predict(input_df)
            score = float(np.mean((input_df.values - reconst) ** 2))
            fraud_prob = float(np.clip(score / 2.0, 0.0, 1.0))

        # Check explicit rules / reasons
        fraud_reasons = []
        if req.duplicate_contract:
            fraud_reasons.append("Duplicate smart contract validation hash matched.")
            fraud_prob = max(fraud_prob, 0.95)
        
        if req.trust_score < 2.0:
            fraud_reasons.append(f"Suspicious counterparty trust score ({req.trust_score}/10).")
            fraud_prob = max(fraud_prob, 0.85)

        base_prices = {"plastic": 20, "metal": 100, "battery": 140, "paper": 10, "textile": 12}
        base_p = base_prices.get(req.material.lower().strip(), 25)
        if req.price > base_p * 3.0:
            fraud_reasons.append(f"Abnormal unit pricing (₹{req.price}/kg vs base ₹{base_p}/kg).")
            fraud_prob = max(fraud_prob, 0.75)

        if req.payment_delay > 40:
            fraud_reasons.append(f"Irregular transaction processing payment delay ({req.payment_delay} days).")
            fraud_prob = max(fraud_prob, 0.70)

        # Risk classification
        if fraud_prob >= 0.85:
            risk_level = "CRITICAL"
            recommended_action = "Transaction suspended. Trigger immediate legal/compliance escrow lock."
        elif fraud_prob >= 0.65:
            risk_level = "HIGH"
            recommended_action = "Escalate for manual auditor inspection before payout."
        elif fraud_prob >= 0.35:
            risk_level = "MEDIUM"
            recommended_action = "Hold for compliance document verification."
        else:
            risk_level = "LOW"
            recommended_action = "Auto-approve. Transaction is clean."

        # Add generic reason if anomalous but no specific rule triggers
        if fraud_prob > 0.45 and len(fraud_reasons) == 0:
            fraud_reasons.append("Multi-dimensional anomaly detection model flagged abnormal patterns.")

        return {
            "fraud_probability": round(fraud_prob, 2),
            "risk_level": risk_level,
            "fraud_reasons": fraud_reasons,
            "duplicate_detected": req.duplicate_contract,
            "recommended_action": recommended_action
        }

    def _fallback_fraud_check(self, req: FraudDetectionRequest) -> dict:
        prob = 0.95 if req.duplicate_contract else 0.10
        return {
            "fraud_probability": prob,
            "risk_level": "CRITICAL" if prob > 0.5 else "LOW",
            "fraud_reasons": ["Duplicate contract flagged"] if req.duplicate_contract else [],
            "duplicate_detected": req.duplicate_contract,
            "recommended_action": "Verify contract details manually" if req.duplicate_contract else "Approve transaction"
        }
