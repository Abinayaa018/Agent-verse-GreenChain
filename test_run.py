from agents.resource_matching.rules import check_resource_matching
from agents.resource_matching.models import WasteProfile

# 1. Define a sample waste profile
profile = WasteProfile(
    material_name="food waste",
    material_category="organic",
    physical_form="solid",
    quantity_value=1000,
    quantity_unit="kg",
    frequency="weekly",
    hazard_class="none"
)

# 2. Run the resource matching pipeline
response = check_resource_matching(profile)

# 3. Print the results
print(f"\nMaterial Name: {response.material_name}")
print(f"Total Matches Found: {response.total_found}\n")
for idx, result in enumerate(response.results, 1):
    print(f"{idx}. Industry: {result.match.industry_name}")
    print(f"   Score: {result.score.weighted_total}/10")
    print(f"   Pitch: {result.pitch_summary}\n")
