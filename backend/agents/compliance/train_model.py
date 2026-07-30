"""
train_model.py

Trains a TensorFlow binary classification model on compliance_dataset.csv
to predict whether a waste handling plan will Pass or Fail compliance.

Outputs:
    compliance_model.keras  — trained TensorFlow model
    encoders.joblib         — dict of LabelEncoders keyed by column name
    scaler.joblib           — fitted StandardScaler for numerical columns

Usage:
    python agents/compliance/train_model.py
"""

import os
import sys
import warnings

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # suppress TF info/warning logs

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(__file__)
DATASET_PATH = os.path.join(BASE_DIR, "compliance_dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "compliance_model.keras")
ENCODERS_PATH = os.path.join(BASE_DIR, "encoders.joblib")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.joblib")

# ---------------------------------------------------------------------------
# Column definitions
# ---------------------------------------------------------------------------
TARGET_COLUMN = "verdict"

CATEGORICAL_COLUMNS = [
    "material",
    "source_industry",
    "destination_industry",
    "hazard_level",
    "hazardous",
    "permit_required",
    "authorized_destination",
    "transport_authorized",
    "pollution_category",
    "required_documents",
]

NUMERICAL_COLUMNS = [
    "quantity_tons",
    "purity",
    "transport_distance_km",
    "missing_documents",
    "compliance_score",
]

DIVIDER = "-" * 60


# ---------------------------------------------------------------------------
# Step 1 — Load data
# ---------------------------------------------------------------------------
def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"Dataset loaded: {len(df)} records, {len(df.columns)} columns")
    return df


# ---------------------------------------------------------------------------
# Step 2 — Encode target
# ---------------------------------------------------------------------------
def encode_target(df: pd.DataFrame) -> tuple[pd.DataFrame, np.ndarray]:
    """Converts 'Pass'/'Fail' to 1/0."""
    y = (df[TARGET_COLUMN].str.strip().str.lower() == "pass").astype(int).values
    df = df.drop(columns=[TARGET_COLUMN])
    pass_count = int(y.sum())
    fail_count = int(len(y) - pass_count)
    print(f"Target distribution  — Pass: {pass_count}  |  Fail: {fail_count}")
    return df, y


# ---------------------------------------------------------------------------
# Step 3 — Encode categorical features
# ---------------------------------------------------------------------------
def encode_categoricals(df: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, LabelEncoder]]:
    encoders: dict[str, LabelEncoder] = {}
    for col in CATEGORICAL_COLUMNS:
        if col not in df.columns:
            continue
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str).str.strip())
        encoders[col] = le
    print(f"Categorical columns encoded: {list(encoders.keys())}")
    return df, encoders


# ---------------------------------------------------------------------------
# Step 4 — Scale numerical features
# ---------------------------------------------------------------------------
def scale_numericals(
    df: pd.DataFrame,
    scaler: StandardScaler | None = None,
    fit: bool = True,
) -> tuple[pd.DataFrame, StandardScaler]:
    cols = [c for c in NUMERICAL_COLUMNS if c in df.columns]
    if scaler is None:
        scaler = StandardScaler()
    if fit:
        df[cols] = scaler.fit_transform(df[cols])
    else:
        df[cols] = scaler.transform(df[cols])
    print(f"Numerical columns scaled : {cols}")
    return df, scaler


# ---------------------------------------------------------------------------
# Step 5 — Build model
# ---------------------------------------------------------------------------
def build_model(input_dim: int) -> tf.keras.Model:
    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=(input_dim,)),
            tf.keras.layers.Dense(64, activation="relu"),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation="relu"),
            tf.keras.layers.Dense(1, activation="sigmoid"),
        ],
        name="compliance_classifier",
    )
    model.compile(
        optimizer="adam",
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    return model


# ---------------------------------------------------------------------------
# Step 6 — Evaluate and print report
# ---------------------------------------------------------------------------
def evaluate(model: tf.keras.Model, X_test: np.ndarray, y_test: np.ndarray) -> None:
    y_prob = model.predict(X_test, verbose=0).flatten()
    y_pred = (y_prob >= 0.5).astype(int)

    accuracy  = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall    = recall_score(y_test, y_pred, zero_division=0)
    f1        = f1_score(y_test, y_pred, zero_division=0)
    cm        = confusion_matrix(y_test, y_pred)

    print(DIVIDER)
    print("  EVALUATION RESULTS")
    print(DIVIDER)
    print(f"  Accuracy  : {accuracy:.4f}")
    print(f"  Precision : {precision:.4f}")
    print(f"  Recall    : {recall:.4f}")
    print(f"  F1 Score  : {f1:.4f}")
    print(DIVIDER)
    print("  Confusion Matrix")
    print(f"  {'':>12} Predicted Fail  Predicted Pass")
    print(f"  Actual Fail  {cm[0][0]:>14}  {cm[0][1]:>13}")
    print(f"  Actual Pass  {cm[1][0]:>14}  {cm[1][1]:>13}")
    print(DIVIDER)
    print("\n  Classification Report\n")
    print(classification_report(y_test, y_pred, target_names=["Fail", "Pass"]))


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------
def main() -> None:
    print("\nGreenChain AI — Compliance Model Training")
    print(DIVIDER)

    # 1. Load
    df = load_data(DATASET_PATH)

    # 2. Target
    df, y = encode_target(df)

    # 3. Categoricals
    df, encoders = encode_categoricals(df)

    # 4. Numericals
    df, scaler = scale_numericals(df, fit=True)

    # 5. Train / test split
    X = df.values.astype(np.float32)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train samples: {len(X_train)}  |  Test samples: {len(X_test)}")
    print(DIVIDER)

    # 6. Build
    model = build_model(input_dim=X_train.shape[1])
    model.summary()
    print(DIVIDER)

    # 7. Train
    print("Training for 30 epochs...\n")
    model.fit(
        X_train, y_train,
        epochs=30,
        batch_size=32,
        validation_split=0.1,
        verbose=1,
    )

    # 8. Evaluate
    evaluate(model, X_test, y_test)

    # 9. Save artifacts
    model.save(MODEL_PATH)
    joblib.dump(encoders, ENCODERS_PATH)
    joblib.dump(scaler, SCALER_PATH)

    print(f"  Model saved   : {MODEL_PATH}")
    print(f"  Encoders saved: {ENCODERS_PATH}")
    print(f"  Scaler saved  : {SCALER_PATH}")
    print(DIVIDER)


if __name__ == "__main__":
    main()
