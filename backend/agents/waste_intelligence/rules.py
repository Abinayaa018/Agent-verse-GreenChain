import os
import tensorflow as tf
import numpy as np
from .models import WasteProfile

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "waste_classifier.h5")
model = tf.keras.models.load_model(MODEL_PATH)

# Exact order confirmed from your training output
CLASS_NAMES = ['battery', 'biological', 'cardboard', 'clothes', 'glass',
               'metal', 'paper', 'plastic', 'shoes', 'trash']

HAZARD_MAP = {
    "battery": "high",
    "biological": "low",
    "cardboard": "low",
    "clothes": "low",
    "glass": "low",
    "metal": "low",
    "paper": "low",
    "plastic": "medium",
    "shoes": "low",
    "trash": "unknown",
}


def classify_waste(image_path: str) -> WasteProfile:
    img = tf.keras.utils.load_img(image_path, target_size=(224, 224))
    arr = tf.keras.utils.img_to_array(img)
    arr = np.expand_dims(arr, axis=0)

    preds = model.predict(arr, verbose=0)[0]
    idx = int(np.argmax(preds))
    label = CLASS_NAMES[idx]
    confidence = float(preds[idx])

    return WasteProfile(
        material_type=label,
        purity_pct=round(confidence * 100, 1),
        hazard_level=HAZARD_MAP.get(label, "unknown"),
        reusable=label != "trash",
    )