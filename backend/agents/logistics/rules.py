import os
import requests
from dotenv import load_dotenv
from .models import LogisticsInput, LogisticsPlan

load_dotenv()
ORS_API_KEY = os.getenv("ORS_API_KEY")

TRANSPORT_MODES = {
    "road_truck": {"cost_per_kg_km": 0.008, "co2_per_kg_km": 0.00012, "speed_kmph": 40},
    "rail":       {"cost_per_kg_km": 0.004, "co2_per_kg_km": 0.00004, "speed_kmph": 30},
}
RAIL_THRESHOLD_KG = 5000


def geocode_city(city_name: str) -> tuple:
    url = "https://api.openrouteservice.org/geocode/search"
    params = {"api_key": ORS_API_KEY, "text": city_name, "size": 1}
    response = requests.get(url, params=params, timeout=10)
    print("DEBUG status:", response.status_code)
    print("DEBUG response:", response.json())
    data = response.json()
    coords = data["features"][0]["geometry"]["coordinates"]
    return tuple(coords)


def get_route_distance_km(source_coords: tuple, dest_coords: tuple) -> float:
    """Gets driving distance in km between two [lon, lat] coordinate pairs."""
    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    headers = {"Authorization": ORS_API_KEY}
    params = {"start": f"{source_coords[0]},{source_coords[1]}",
              "end": f"{dest_coords[0]},{dest_coords[1]}"}
    response = requests.get(url, headers=headers, params=params, timeout=10).json()
    meters = response["features"][0]["properties"]["segments"][0]["distance"]
    return round(meters / 1000, 1)


def estimate_distance(source: str, destination: str) -> float:
    try:
        source_coords = geocode_city(source)
        dest_coords = geocode_city(destination)
        return get_route_distance_km(source_coords, dest_coords)
    except Exception as e:
        print(f"⚠️ Distance API failed ({e}), using fallback 150km")
        return 150.0  # graceful fallback so the demo never crashes


def choose_transport_mode(quantity_kg: float) -> str:
    return "rail" if quantity_kg >= RAIL_THRESHOLD_KG else "road_truck"


def calculate_logistics(
    material_type: str, quantity_kg: float,
    source_location: str, destination_location: str,
    distance_km: float = None,
) -> LogisticsPlan:
    distance = distance_km or estimate_distance(source_location, destination_location)
    mode = choose_transport_mode(quantity_kg)
    factors = TRANSPORT_MODES[mode]

    cost = round(quantity_kg * distance * factors["cost_per_kg_km"], 2)
    co2 = round(quantity_kg * distance * factors["co2_per_kg_km"], 2)
    days = round(distance / (factors["speed_kmph"] * 8), 2)

    return LogisticsPlan(
        material_type=material_type.lower(),
        quantity_kg=quantity_kg,
        distance_km=distance,
        transport_mode=mode,
        estimated_cost_inr=cost,
        estimated_co2_kg=co2,
        estimated_days=max(days, 0.5),
    )