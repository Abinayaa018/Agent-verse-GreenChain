from agents.resource_matching.models import WasteProfile, SourceLocation
from agents.resource_matching.rules import check_resource_matching

profile = WasteProfile(
    material_name="PET Plastic",
    material_category="plastic",
    physical_form="solid",
    quantity_value=500,
    quantity_unit="kg",
    frequency="weekly",
    hazard_class="none",
    purity_pct=95,
    source_location=SourceLocation(
        address="Coimbatore",
        region="Tamil Nadu",
    ),
    max_transport_distance_km=100,
    current_disposal_method="Landfill",
    current_disposal_cost_per_unit=10,
)

response = check_resource_matching(profile)

print("=" * 70)
print("RESOURCE MATCHING RESULTS")
print("=" * 70)
print(f"Material      : {response.material_name}")
print(f"Total Matches : {response.total_found}")
print()

for i, result in enumerate(response.results, start=1):
    print(f"Match #{i}")
    print("-" * 40)
    print("Industry        :", result.match.industry_name)
    print("Reuse Pathway   :", result.match.reuse_pathway)
    print("Overall Score   :", result.score.weighted_total)
    print("Confidence      :", result.score.confidence)

    if result.pitch_summary:
        print("Summary         :", result.pitch_summary)

    print()