from .models import WasteProfileInput, CircularInnovationRequest
from .rules import CircularInnovationEngine, format_innovation_report

# Sample waste profile
profile = WasteProfileInput(
    material_name="Spent Lithium Black Mass",
    material_category="e_waste",
    physical_form="powder",
    purity_pct=92.0,
    quantity_value=500,
    quantity_unit="kg",
    frequency="monthly",
    hazard_class="moderate",
)

# Create request
request = CircularInnovationRequest(
    profile=profile,
    max_recommendations=3
)

# Run engine
engine = CircularInnovationEngine(use_api_search=False)
response = engine.discover_innovations(request)

# Print formatted report
print(format_innovation_report(response))