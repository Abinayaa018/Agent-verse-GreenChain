"""Real-time Live Content Execution Script for GreenChain AI Circular Innovation Agent.

Fetches live real-time scientific literature (OpenAlex, Crossref, Semantic Scholar)
and live patent databases for any industrial waste stream.
"""

import sys
import argparse
import json
from agents.circular_innovation.models import WasteProfileInput, CircularInnovationRequest
from agents.circular_innovation.rules import CircularInnovationEngine
from agents.circular_innovation.utils import format_innovation_report

def main():
    parser = argparse.ArgumentParser(description="GreenChain AI Real-Time Circular Innovation Agent")
    parser.add_argument("--material", type=str, default="Spent Lithium Battery Black Mass", help="Name of unmatched waste material")
    parser.add_argument("--category", type=str, default="e_waste", help="Material category (e.g., organic, metal, chemical, e_waste, plastic)")
    parser.add_argument("--form", type=str, default="solid", help="Physical form (solid, liquid, sludge, granulate, powder)")
    parser.add_argument("--quantity", type=float, default=1000.0, help="Quantity in kg/tonnes")
    parser.add_argument("--hazard", type=str, default="none", help="Hazard class (none, low, moderate, high, regulated)")
    parser.add_argument("--no-cache", action="store_true", help="Bypass cache and force fresh real-time web retrieval")
    parser.add_argument("--json", action="store_true", help="Output raw JSON instead of formatted report")

    args = parser.parse_args()

    print("\n" + "=" * 80)
    print("      GREENCHAIN AI - REAL-TIME CIRCULAR INNOVATION AGENT")
    print("=" * 80)
    print(f"[*] Query Material : {args.material}")
    print(f"[*] Category       : {args.category}")
    print(f"[*] Live API Search: ENABLED (OpenAlex / Crossref / Semantic Scholar)")
    print(f"[*] Bypass Cache   : {args.no_cache}")
    print("=" * 80 + "\n")

    # 1. Instantiate engine with Live Real-Time Web API Search enabled (use_api_search=True)
    engine = CircularInnovationEngine(use_api_search=True)

    # 3. Create waste profile request
    profile = WasteProfileInput(
        material_name=args.material,
        material_category=args.category,
        physical_form=args.form,
        quantity_value=args.quantity,
        quantity_unit="kg",
        frequency="monthly",
        hazard_class=args.hazard,
    )

    request = CircularInnovationRequest(
        profile=profile,
        max_recommendations=3
    )

    print(f"[+] Querying live scientific publications & patent databases for '{args.material}'...\n")
    response = engine.discover_innovations(request)

    # 4. Output results
    if args.json:
        print(json.dumps(response.model_dump(), indent=2))
    else:
        report = format_innovation_report(response)
        print(report)

if __name__ == "__main__":
    main()
