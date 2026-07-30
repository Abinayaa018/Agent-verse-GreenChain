"""
train_model.py

Trains a Random Forest multi-class classifier on economic_dataset.csv
to predict the profitability category of a waste transaction.

Target classes:
    Loss | Low Profit | Moderate Profit | High Profit | Excellent

Outputs:
    economic_model.joblib    — trained RandomForestClassifier
    eco_encoders.joblib      — dict of LabelEncoders for categorical columns
    eco_scaler.joblib        — fitted StandardScaler for numerical columns

Usage:
    python agents/economic_value/train_model.py
"""

import os
import sys
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
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

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR      = os.path.dirname(__file__)
DATASET_PATH  = os.path.join(BASE_DIR, "economic_dataset.csv")
MODEL_PATH    = os.path.join(BASE_DIR, "economic_model.joblib")
ENCODERS_PATH = os.path.join(BASE_DIR, "eco_encoders.joblib")
SCALER_PATH   = os.path.join(BASE_DIR, "eco_scaler.joblib")

# ---------------------------------------------------------------------------
# Column definitions
# ---------------------------------------------------------------------------
TARGET_COLUMN = "profitability"

CATEGORICAL_COLUMNS = [
    "material",
    "source_industry",
    "destination_industry",
]

NUMERICAL_COLUMNS = [
    "quantity_tons",
    "purity",
    "transport_distance_km",
    "market_price_per_ton",
    "processing_cost_per_ton",
    "transport_cost_per_km",
    "revenue",
    "processing_cost",
    "transport_cost",
    "total_cost",
    "net_profit",
    "roi_percent",
]

# Ordered class labels for consistent display
CLASS_ORDER = ["Loss", "Low Profit", "Moderate Profit", "High Profit", "Excellent"]

DIVIDER = "-" * 60


# ---------------------------------------------------------------------------
# Pipeline steps
# ---------------------------------------------------------------------------

def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"Dataset loaded     : {len(df)} records, {len(df.columns)} columns")
    return df


def encode_target(df: pd.DataFrame) -> tuple[pd.DataFrame, np.ndarray, LabelEncoder]:
    le = LabelEncoder()
    le.fit(CLASS_ORDER)
    y = le.transform(df[TARGET_COLUMN].str.strip())
    df = df.drop(columns=[TARGET_COLUMN])
    print("Target distribution:")
    for cls in CLASS_ORDER:
        count = int((df[TARGET_COLUMN] if TARGET_COLUMN in df.columns
                     else pd.Series(le.inverse_transform(y))) == cls
                    if TARGET_COLUMN in df.columns else
                    (le.inverse_transform(y) == cls).sum())
        _ = count  # computed below more cleanly
    for cls, cnt in zip(*np.unique(le.inverse_transform(y), return_counts=True)):
        print(f"  {cls:<20}: {cnt}")
    return df, y, le


def encode_categoricals(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    encoders = {}
    for col in CATEGORICAL_COLUMNS:
        if col not in df.columns:
            continue
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str).str.strip())
        encoders[col] = le
    print(f"Categoricals encoded: {list(encoders.keys())}")
    return df, encoders


def scale_numericals(df: pd.DataFrame) -> tuple[pd.DataFrame, StandardScaler]:
    cols = [c for c in NUMERICAL_COLUMNS if c in df.columns]
    scaler = StandardScaler()
    df[cols] = scaler.fit_transform(df[cols])
    print(f"Numericals scaled  : {cols}")
    return df, scaler


def build_model() -> RandomForestClassifier:
    return RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_leaf=1,
        class_weight="balanced",   # handles the heavy Excellent imbalance
        random_state=42,
        n_jobs=-1,
    )


def evaluate(model, X_test: np.ndarray, y_test: np.ndarray, label_encoder: LabelEncoder) -> None:
    y_pred = model.predict(X_test)
    labels = label_encoder.transform(CLASS_ORDER)
    names  = CLASS_ORDER

    accuracy  = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall    = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1        = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cm        = confusion_matrix(y_test, y_pred, labels=labels)

    print(DIVIDER)
    print("  EVALUATION RESULTS")
    print(DIVIDER)
    print(f"  Accuracy  : {accuracy:.4f}  ({accuracy*100:.2f}%)")
    print(f"  Precision : {precision:.4f}  (weighted)")
    print(f"  Recall    : {recall:.4f}  (weighted)")
    print(f"  F1 Score  : {f1:.4f}  (weighted)")
    print(DIVIDER)
    print("  Confusion Matrix")
    print(f"  {'':>18} " + "  ".join(f"{n[:8]:>8}" for n in names))
    for i, row_name in enumerate(names):
        row_str = "  ".join(f"{cm[i][j]:>8}" for j in range(len(names)))
        print(f"  {row_name:<18} {row_str}")
    print(DIVIDER)
    print("\n  Classification Report\n")
    print(classification_report(
        y_test, y_pred,
        labels=labels,
        target_names=names,
        zero_division=0,
    ))


def print_feature_importance(model, feature_names: list[str]) -> None:
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:10]
    print(DIVIDER)
    print("  TOP 10 FEATURE IMPORTANCES")
    print(DIVIDER)
    for rank, idx in enumerate(indices, 1):
        print(f"  {rank:>2}. {feature_names[idx]:<30} {importances[idx]:.4f}")
    print(DIVIDER)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("\nGreenChain AI — Economic Value Model Training")
    print(DIVIDER)

    df = load_data(DATASET_PATH)

    df, y, label_encoder = encode_target(df)
    df, cat_encoders     = encode_categoricals(df)
    df, scaler           = scale_numericals(df)

    X = df[[c for c in CATEGORICAL_COLUMNS + NUMERICAL_COLUMNS if c in df.columns]].values.astype(np.float32)
    feature_names = [c for c in CATEGORICAL_COLUMNS + NUMERICAL_COLUMNS if c in df.columns]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train samples      : {len(X_train)}")
    print(f"Test  samples      : {len(X_test)}")
    print(DIVIDER)

    print("Training Random Forest (300 trees, balanced class weights)...")
    model = build_model()
    model.fit(X_train, y_train)
    print("Training complete.")

    evaluate(model, X_test, y_test, label_encoder)
    print_feature_importance(model, feature_names)

    # Save artifacts
    joblib.dump(model,        MODEL_PATH)
    joblib.dump({"categorical": cat_encoders, "target": label_encoder}, ENCODERS_PATH)
    joblib.dump(scaler,       SCALER_PATH)

    print(f"  Model saved    : {MODEL_PATH}")
    print(f"  Encoders saved : {ENCODERS_PATH}")
    print(f"  Scaler saved   : {SCALER_PATH}")
    print(DIVIDER)


if __name__ == "__main__":
    main()
