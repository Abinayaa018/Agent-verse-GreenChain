from agents.circular_innovation.models import WasteProfileInput, CircularInnovationRequest
from agents.circular_innovation.rules import CircularInnovationEngine, format_innovation_report

def run_demo():
    # Instantiate Circular Innovation Engine
    engine = CircularInnovationEngine(use_api_search=False)

    # Define an un-matched industrial waste profile (e.g. Spent Lithium Battery Black Mass)
    profile = WasteProfileInput(
        material_name="Spent Lithium Battery Black Mass",
        material_category="e_waste",
        physical_form="powder",
        quantity_value=5000.0,
        quantity_unit="kg",
        frequency="monthly",
        hazard_class="regulated",
        current_disposal_method="Hazardous Storage",
        current_disposal_cost_per_unit=120.0,
        notes="Spent battery cathode sludge containing Lithium, Cobalt, Nickel, and Graphite."
    )

    request = CircularInnovationRequest(
        profile=profile,
        max_recommendations=3
    )

    print(f"\n[INBOUND TRIGGER] Processing Un-matched Waste Material: '{profile.material_name}'...\n")
    response = engine.discover_innovations(request)

    # Print structured report with subheadings
    report_text = format_innovation_report(response)
    print(report_text)

    print("\n" + "=" * 80)
    print("                    STRUCTURED JSON PAYLOAD OUTPUT")
    print("=" * 80)
    print(json.dumps(response.model_dump(), indent=2))

if __name__ == "__main__":
    run_demo()
