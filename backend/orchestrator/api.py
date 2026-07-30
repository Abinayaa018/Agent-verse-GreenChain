import os
import sys
import uuid
import logging
import json
import numpy as np
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Add project root to sys.path FIRST
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


# Create FastAPI app
app = FastAPI(
    title="GreenChain AI REST API",
    version="1.0"
)

@app.get("/")
def home():
    return {
        "message": "GreenChain AI API is running",
        "status": "ok"
    }

# Reports directory
REPORTS_DIR = os.path.join(PROJECT_ROOT, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


# Serve generated reports
app.mount(
    "/reports",
    StaticFiles(directory=REPORTS_DIR),
    name="reports",
)
# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Import agent rules/pricing/methods
from agents.waste_intelligence.rules import classify_waste
from agents.environmental_impact.rules import calculate_impact
from agents.economic_value.pricing import evaluate as evaluate_pricing
from agents.economic_value.models import EconomicValueRequest
from agents.resource_matching.rules import check_resource_matching
from agents.resource_matching.models import WasteProfile as MatchWasteProfile
from agents.compliance.rules import check_compliance
from agents.compliance.models import ComplianceCheckRequest
from agents.circular_innovation.rules import CircularInnovationRules, find_innovation_pathways
from agents.circular_innovation.models import WasteProfileInput as InnovationWasteProfileInput
from agents.logistics.rules import calculate_logistics, geocode_city, get_route_distance_km
from agents.marketplace.rules import evaluate_transaction, load_registry
from agents.audit.rules import record_transaction, load_ledger, aggregate_company_esg
from agents.audit.report_generator import generate_esg_report

# Import new agents rules and model schemas
from agents.chatbot.rules import ChatbotOrchestrator
from agents.chatbot.models import ChatRequest, ChatResponse
from agents.onboarding_kyc.rules import KYCVerificationEngine
from agents.onboarding_kyc.models import KYCVerifyRequest
from agents.dynamic_pricing.rules import DynamicPricingEngine
from agents.carbon_credit.rules import CarbonTokenizationEngine
from agents.carbon_credit.models import TokenizeRequest
from agents.multilingual.rules import TranslationEngine
from agents.multilingual.models import TranslateRequest

# Import Agent 10-13 rules and models
from agents.demand_forecasting.rules import DemandForecastingEngine
from agents.waste_prediction.rules import WastePredictionEngine
from agents.waste_prediction.models import WastePredictionRequest
from agents.collection_scheduler.rules import CollectionSchedulingEngine
from agents.collection_scheduler.models import SchedulePickupRequest
from agents.recycling_capacity.rules import RecyclingCapacityEngine

# Import Agent 14-17 rules and models
from agents.material_quality_prediction.rules import MaterialQualityEngine
from agents.material_quality_prediction.models import MaterialQualityRequest
from agents.fraud_detection.rules import FraudDetectionEngine
from agents.fraud_detection.models import FraudDetectionRequest
from agents.esg_benchmarking.rules import ESGBenchmarkingEngine
from agents.sustainability_recommendation.rules import SustainabilityRecommendationEngine
from agents.sustainability_recommendation.models import SustainabilityAdvisorRequest

# Import Agent 18-27 rules and models
from agents.negotiation.rules import NegotiationEngine
from agents.negotiation.models import NegotiateRequest
from agents.smart_contract.rules import SmartContractEngine
from agents.smart_contract.models import ContractRequest
from agents.insurance_risk.rules import InsuranceRiskEngine
from agents.insurance_risk.models import RiskAssessmentRequest
from agents.circular_roi.rules import CircularROIEngine
from agents.circular_roi.models import ROIRequest
from agents.waste_auction.rules import WasteAuctionEngine
from agents.waste_auction.models import BidRequest
from agents.industrial_collaboration.rules import IndustrialCollaborationEngine
from agents.sustainability_reputation.rules import SustainabilityReputationEngine
from agents.circular_supply_risk.rules import CircularSupplyRiskEngine
from agents.waste_origin_traceability.rules import TraceabilityEngine
from agents.waste_origin_traceability.models import CheckpointRequest
from agents.circular_investment.rules import CircularInvestmentEngine
from agents.circular_investment.models import InvestmentRequest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GreenChainAPI")

# Instantiate rule engines globally
chatbot_engine = ChatbotOrchestrator()
kyc_engine = KYCVerificationEngine()
pricing_engine = DynamicPricingEngine()
carbon_engine = CarbonTokenizationEngine()
translation_engine = TranslationEngine()

demand_forecasting_engine = DemandForecastingEngine()
waste_prediction_engine = WastePredictionEngine()
collection_scheduler_engine = CollectionSchedulingEngine()
recycling_capacity_engine = RecyclingCapacityEngine()

material_quality_engine = MaterialQualityEngine()
fraud_detection_engine = FraudDetectionEngine()
esg_benchmarking_engine = ESGBenchmarkingEngine()
sustainability_recommendation_engine = SustainabilityRecommendationEngine()

negotiation_engine = NegotiationEngine()
smart_contract_engine = SmartContractEngine()
insurance_risk_engine = InsuranceRiskEngine()
circular_roi_engine = CircularROIEngine()
waste_auction_engine = WasteAuctionEngine()
industrial_collaboration_engine = IndustrialCollaborationEngine()
sustainability_reputation_engine = SustainabilityReputationEngine()
circular_supply_risk_engine = CircularSupplyRiskEngine()
traceability_engine = TraceabilityEngine()
circular_investment_engine = CircularInvestmentEngine()

# Import Agents 28-37
from agents.supplier_reliability.rules import SupplierReliabilityEngine
from agents.circular_design.rules import CircularDesignEngine
from agents.circular_design.models import CircularDesignRequest
from agents.energy_optimization.rules import EnergyOptimizationEngine
from agents.emission_monitoring.rules import EmissionMonitoringEngine
from agents.hazard_classification.rules import HazardClassificationEngine
from agents.hazard_classification.models import HazardClassificationRequest
from agents.resource_availability.rules import ResourceAvailabilityEngine
from agents.circular_procurement.rules import CircularProcurementEngine
from agents.circular_procurement.models import ProcurementRequest
from agents.facility_expansion.rules import FacilityExpansionEngine
from agents.workforce_optimization.rules import WorkforceOptimizationEngine
from agents.circular_policy.rules import CircularPolicyEngine
from agents.circular_policy.models import PolicyRequest

# Instantiate Agents 28-37
supplier_reliability_engine = SupplierReliabilityEngine()
circular_design_engine = CircularDesignEngine()
energy_optimization_engine = EnergyOptimizationEngine()
emission_monitoring_engine = EmissionMonitoringEngine()
hazard_classification_engine = HazardClassificationEngine()
resource_availability_engine = ResourceAvailabilityEngine()
circular_procurement_engine = CircularProcurementEngine()
facility_expansion_engine = FacilityExpansionEngine()
workforce_optimization_engine = WorkforceOptimizationEngine()
circular_policy_engine = CircularPolicyEngine()



# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard city coordinates mapping for reliable fallbacks
CITY_COORDS = {
    "chennai": [80.2707, 13.0827],
    "tiruppur": [77.3411, 11.1085],
    "coimbatore": [76.9558, 11.0168],
    "madurai": [78.1198, 9.9252],
    "bangalore": [77.5946, 12.9716],
    "mumbai": [72.8777, 19.0760],
    "delhi": [77.2090, 28.6139],
    "hyderabad": [78.4867, 17.3850],
    "kolkata": [88.3639, 22.5726],
}

MATERIAL_TO_CATEGORY = {
    "battery": "hazardous",
    "biological": "organic",
    "cardboard": "general",
    "clothes": "general",
    "glass": "general",
    "metal": "general",
    "paper": "general",
    "plastic": "general",
    "shoes": "general",
    "trash": "general",
}

class TransactionRequest(BaseModel):
    material_type: str
    quantity_kg: float
    seller_name: str
    buyer_name: str
    proposed_price_inr: float

@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.post("/api/analyze")
async def analyze(
    material_type: str = Form(...),
    quantity: float = Form(...),  # in tons
    location: str = Form(...),
    industry: str = Form(...),
    description: str = Form(...),
    company_name: str = Form("Tiruppur Textiles"),
    destination: str = Form("Authorized Recycler"),
    image: Optional[UploadFile] = File(None)
):
    try:
        waste_profile_id = f"GC-PROFILE-{uuid.uuid4().hex[:6].upper()}"
        purity_pct = 95.0
        hazard_level = "low"
        confidence = 0.95
        reusable = True

        # 1. Process image classification if uploaded
        if image:
            # Create a scratch folder if not exists
            scratch_dir = os.path.join(PROJECT_ROOT, "scratch")
            os.makedirs(scratch_dir, exist_ok=True)
            temp_path = os.path.join(scratch_dir, f"temp_{uuid.uuid4().hex}_{image.filename}")
            
            with open(temp_path, "wb") as f:
                content = await image.read()
                f.write(content)

            try:
                profile = classify_waste(temp_path)
                material_type = profile.material_type
                purity_pct = profile.purity_pct
                hazard_level = profile.hazard_level
                reusable = profile.reusable
                confidence = purity_pct / 100.0
            except Exception as e:
                logger.error(f"Classification failed: {e}")
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        quantity_kg = quantity * 1000.0

        # 2. Environmental Impact
        impact = calculate_impact(material_type, quantity_kg)

        # 3. Economic Valuation
        distance_km = 150.0
        pricing_req = EconomicValueRequest(
            waste_profile_id=waste_profile_id,
            material=material_type,
            source_industry=industry,
            destination_industry=destination,
            purity=purity_pct,
            quantity_tons=quantity,
            transport_distance_km=distance_km
        )
        pricing_res = evaluate_pricing(pricing_req)

        # 4. Resource Matching

        category_map = {
            "plastic": "plastic",
            "metal": "metal",
            "glass": "glass",
            "paper": "paper_pulp",
            "cardboard": "paper_pulp",
            "battery": "e_waste",
            "clothes": "textile",
            "textile": "textile",
            "organic": "organic",
            "food": "organic",
        }

        hazard_map = {
            "low": "low",
            "medium": "moderate",
            "moderate": "moderate",
            "high": "high",
        }

        match_profile = MatchWasteProfile(
            material_name=material_type,

            material_category=category_map.get(
                material_type.lower(),
                "other"
            ),

            physical_form="solid",

            purity_pct=purity_pct,

            quantity_value=quantity_kg,

            quantity_unit="kg",

            frequency="one_off",

            hazard_class=hazard_map.get(
                hazard_level.lower(),
                "none"
            ),

            current_disposal_cost_per_unit=50,

            max_transport_distance_km=150,

            exclusions=[],

            notes=description,
        )

        match_res = check_resource_matching(match_profile)

        # 5. Compliance check
        category = MATERIAL_TO_CATEGORY.get(material_type.lower(), "general")
        dest_map = {
            "authorized recycler": "recycling_center",
            "certified facility": "certified_facility",
            "composting site": "composting_site",
            "approved treatment plant": "approved_treatment_plant",
            "landfill": "landfill",
        }
        dest_key = dest_map.get(destination.lower(), "recycling_center")

        comp_req = ComplianceCheckRequest(
            waste_profile_id=waste_profile_id,
            category=category,
            hazard_level=hazard_level,
            destination=dest_key,
            transport_mode="road"
        )
        comp_res = check_compliance(comp_req)

        # Build combined compliance attributes for UI requirements
        violations = comp_res.violations
        is_compliant = comp_res.is_compliant
        status = "PASS" if is_compliant else "FAIL"
        compliance_score = 100.0 - (len(violations) * 25.0) if not is_compliant else 100.0
        required_docs = ["Waste manifest", "Safety data sheet"]
        if category == "organic":
            required_docs.append("Organic waste record-keeping")
        elif category == "hazardous":
            required_docs.extend(["Hazardous material license", "Transport permit"])

        compliance_payload = {
            "is_compliant": is_compliant,
            "status": status,
            "compliance_score": max(0.0, compliance_score),
            "confidence": 0.94,
            "violations": violations if violations else [],
            "warnings": comp_res.warnings if comp_res.warnings else [],
            "regulations_applied": comp_res.regulations_applied,
            "required_permits": comp_res.required_permits,
            "required_documents": required_docs,
            "recommendations": [
                "Keep separate storage areas.",
                "Verify transporter verification records prior to dispatch."
            ]
        }

        # 6. Circular Innovation Check
        innov_profile = InnovationWasteProfileInput(
            material_name=material_type,
            material_category=category,
            purity_pct=purity_pct,
            quantity_value=quantity_kg,
            quantity_unit="kg",
            hazard_class=hazard_level
        )
        innov_res = CircularInnovationRules().check_circular_innovation(innov_profile)

        # 7. Record transaction in ESG ledger
        contract_id = f"GC-{uuid.uuid4().hex[:8].upper()}"
        record_transaction(company_name, material_type, quantity_kg, contract_id)

        response_data = {
            "waste_profile_id": waste_profile_id,
            "material_type": material_type.title(),
            "purity_pct": purity_pct,
            "hazard_level": hazard_level.title(),
            "reusable": reusable,
            "confidence": confidence,
            "description": description,
            "environmental_impact": {
                "co2_saved_kg": impact.co2_saved_kg,
                "landfill_diverted_kg": impact.landfill_diverted_kg,
                "circularity_score": impact.circularity_score
            },
            "economic_value": {
                "estimated_price": pricing_res.market_price_per_ton,
                "price_range": f"{pricing_res.market_price_per_ton * 0.9:,.0f} - {pricing_res.market_price_per_ton * 1.1:,.0f} INR",
                "demand_score": 85 if reusable else 20,
                "processing_cost": pricing_res.processing_cost,
                "transport_cost": pricing_res.transport_cost,
                "revenue": pricing_res.revenue,
                "total_cost": pricing_res.total_cost,
                "net_profit": pricing_res.net_profit,
                "roi_percent": pricing_res.roi_percent,
                "profitability": pricing_res.profitability,
                "recommendation": pricing_res.recommendation
            },
            "resource_matching": {
                "results": [
                    {
                        "buyer_name": r.match.industry_name,
                        "industry_name": r.match.industry_name,
                        "score": round(r.score.weighted_total, 2),
                        "pitch_summary": r.pitch_summary,
                    }
                    for r in match_res.results
                ],
                "total_found": match_res.total_found,
            },
            
            "compliance": compliance_payload,
            "circular_innovation": {
                "query_material": innov_res.query_material,
                "material_category": innov_res.material_category,
                "discoveries": [
                    {
                        "innovation_id": d.innovation_id,
                        "title": d.discovery_title,
                        "transformation_pathway": d.transformation_pathway,
                        "trl_level": d.trl_level,
                        "trl_description": d.trl_stage_description,
                        "novelty_index": d.novelty_index,
                        "score": d.innovation_score,
                        "environmental_benefits": d.environmental_benefits,
                        "industrial_benefits": d.industrial_benefits
                    } for d in innov_res.discoveries
                ]
            },
            "contract_id": contract_id
        }

        return response_data

    except Exception as e:
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard")
def get_dashboard(company_name: str = "Tiruppur Textiles"):
    try:
        ledger = load_ledger()
        history = ledger.get(company_name, [])
        registry = load_registry()

        total_waste = 0.0
        total_co2 = 0.0
        total_diverted = 0.0
        
        for entry in history:
            total_waste += entry.get("quantity_kg", 0)
            total_co2 += entry.get("co2_saved_kg", 0)
            total_diverted += entry.get("landfill_diverted_kg", 0)

        # Convert waste and diversion to tons for display
        total_waste_tons = total_waste / 1000.0
        total_diverted_tons = total_diverted / 1000.0

        # Circularity Score: average rating
        avg_score = 82.5 if len(history) > 0 else 0.0

        # Sum up revenue based on registry or simple estimate
        # base processing cost vs sales
        revenue = total_waste_tons * 48000.0  # mock revenue value based on transactions

        # Prepare chart trends
        monthly_trend = [
            {"month": "Feb", "co2": 150, "diverted": 120, "waste": 150},
            {"month": "Mar", "co2": 280, "diverted": 220, "waste": 280},
            {"month": "Apr", "co2": 420, "diverted": 350, "waste": 420},
            {"month": "May", "co2": 610, "diverted": 500, "waste": 610},
            {"month": "Jun", "co2": 850, "diverted": 720, "waste": 850},
            {"month": "Jul", "co2": total_co2, "diverted": total_diverted, "waste": total_waste_tons}
        ]

        # Categories distribution
        cat_counts = {}
        for entry in history:
            m = entry.get("material_type", "mixed")
            cat_counts[m] = cat_counts.get(m, 0) + (entry.get("quantity_kg", 0) / 1000.0)

        cat_breakdown = [
            {"name": k.title(), "value": round(v, 2)} for k, v in cat_counts.items()
        ]
        if not cat_breakdown:
            cat_breakdown = [{"name": "No Data", "value": 0.0}]

        # Marketplace matches: confirmed status records
        matches_count = len(history)

        return {
            "total_waste_processed": round(total_waste_tons, 2),
            "revenue_generated": round(revenue, 2),
            "co2_saved": round(total_co2, 2),
            "landfill_diverted": round(total_diverted_tons, 2),
            "circularity_score": avg_score,
            "marketplace_matches": matches_count,
            "recent_analyses": history[-5:][::-1],
            "charts": {
                "monthly_trend": monthly_trend,
                "category_breakdown": cat_breakdown
            }
        }
    except Exception as e:
        logger.exception("Failed fetching dashboard stats")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports")
def get_reports(company_name: str = "Tiruppur Textiles"):
    try:
        reports_dir = os.path.join(PROJECT_ROOT, "reports")
        if not os.path.exists(reports_dir):
            return []
        
        pdf_files = [f for f in os.listdir(reports_dir) if f.endswith(".pdf")]
        reports_list = []
        for f in pdf_files:
            file_path = os.path.join(reports_dir, f)
            stat = os.stat(file_path)
            reports_list.append({
                "filename": f,
                "created_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "size_bytes": stat.st_size
            })
        return reports_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/download/{filename}")
def download_report(filename: str):
    try:
        file_path = os.path.join(REPORTS_DIR, filename)

        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404,
                detail="Report not found"
            )

        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=filename
        )

    except Exception as e:
        logger.exception("Report download failed")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@app.post("/api/reports/generate")
def generate_report(company_name: str = Form("Tiruppur Textiles")):
    try:
        ledger = load_ledger()
        history = ledger.get(company_name, [])
        if not history:
            raise HTTPException(status_code=400, detail="No transaction history to audit.")

        summary = aggregate_company_esg(history)
        filepath = generate_esg_report(company_name, summary, history)
        return {"status": "success", "filename": os.path.basename(filepath)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/marketplace")
def get_marketplace():
    try:
        registry = load_registry()
        # Transform registry into list of company rankings
        companies = []
        for name, data in registry.items():
            trust_score = 50.0
            history_bonus = min(data.get("completed_transactions", 0) * 2, 30)
            dispute_penalty = data.get("disputes", 0) * 10
            verification_bonus = 10 if data.get("is_verified_business", False) else 0
            reliability_bonus = data.get("on_time_delivery_rate", 1.0) * 10 if data.get("completed_transactions", 0) > 0 else 0
            trust_score = round(max(0.0, min(50.0 + history_bonus - dispute_penalty + verification_bonus + reliability_bonus, 100.0)), 1)
            companies.append({
                "company_name": name,
                "trust_score": trust_score,
                "completed_transactions": data.get("completed_transactions", 0),
                "is_verified": data.get("is_verified_business", False)
            })

        listings = [
            {"id": "LST-001", "material": "Cotton Scrap", "quantity": "5000 kg", "price": "1,20,000 INR", "seller": "Tiruppur Textiles", "status": "active"},
            {"id": "LST-002", "material": "Plastic Scrap", "quantity": "8000 kg", "price": "96,000 INR", "seller": "EcoFibre Ltd", "status": "active"},
            {"id": "LST-003", "material": "Used Battery Black Mass", "quantity": "1200 kg", "price": "4,50,000 INR", "seller": "Electro-Recycle", "status": "pending"},
            {"id": "LST-004", "material": "Glass Bottles", "quantity": "15000 kg", "price": "30,000 INR", "seller": "Tiruppur Textiles", "status": "active"},
        ]

        return {
            "companies": sorted(companies, key=lambda x: x["trust_score"], reverse=True),
            "listings": listings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/marketplace/transaction")
def make_transaction(req: TransactionRequest):
    try:
        record = evaluate_transaction(
            material_type=req.material_type,
            quantity_kg=req.quantity_kg,
            seller_name=req.seller_name,
            buyer_name=req.buyer_name,
            proposed_price_inr=req.proposed_price_inr
        )
        return record
    except Exception as e:
        logger.exception("Marketplace transaction failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logistics")
def get_logistics(
    source: str = "Tiruppur",
    destination: str = "Chennai",
    quantity_kg: float = 1200.0,
    material: str = "Cotton Scrap"
):
    try:
        # Geocode locations
        source_norm = source.lower().strip()
        dest_norm = destination.lower().strip()

        # Find coordinates
        s_coords = None
        d_coords = None

        # Look in local standard city mapping first
        if source_norm in CITY_COORDS:
            s_coords = CITY_COORDS[source_norm]
        if dest_norm in CITY_COORDS:
            d_coords = CITY_COORDS[dest_norm]

        # Use geocoder rules if available
        if not s_coords:
            try:
                s_coords = geocode_city(source)
            except Exception:
                s_coords = [77.5946, 12.9716] # default Bangalore
        if not d_coords:
            try:
                d_coords = geocode_city(destination)
            except Exception:
                d_coords = [80.2707, 13.0827] # default Chennai

        # Estimate distance
        dist_km = 150.0
        route_coords = []
        try:
            dist_km = get_route_distance_km(s_coords, d_coords)
            # Fetch route polyline via OpenRouteService
            import requests
            from dotenv import load_dotenv
            load_dotenv()
            key = os.getenv("ORS_API_KEY")
            url = "https://api.openrouteservice.org/v2/directions/driving-car"
            headers = {"Authorization": key}
            params = {"start": f"{s_coords[0]},{s_coords[1]}",
                      "end": f"{d_coords[0]},{d_coords[1]}"}
            res = requests.get(url, headers=headers, params=params, timeout=10).json()
            route_coords = res["features"][0]["geometry"]["coordinates"]
        except Exception:
            # Fallback simple line path interpolation if ORS directions fail
            logger.info("ORS route polyline failed, using linear interpolation fallback.")
            dist_km = np.sqrt((s_coords[0]-d_coords[0])**2 + (s_coords[1]-d_coords[1])**2) * 111.0
            dist_km = round(max(dist_km, 50.0), 1)
            
            # Interpolate 10 points between start and end with a tiny curve
            for t in np.linspace(0, 1, 15):
                lon = s_coords[0] + t * (d_coords[0] - s_coords[0])
                lat = s_coords[1] + t * (d_coords[1] - s_coords[1])
                # add curve wave offset
                wave = 0.05 * np.sin(t * np.pi)
                route_coords.append([lon - wave, lat + wave])

        plan = calculate_logistics(material, quantity_kg, source, destination, distance_km=dist_km)

        return {
            "origin": {
                "name": source.title(),
                "lat": s_coords[1],
                "lng": s_coords[0]
            },
            "destination": {
                "name": destination.title(),
                "lat": d_coords[1],
                "lng": d_coords[0]
            },
            "distance_km": dist_km,
            "duration_minutes": int(plan.estimated_days * 8 * 60), # convert driving days to minutes
            "vehicle": "Train" if plan.transport_mode == "rail" else "Road Truck",
            "transport_cost": plan.estimated_cost_inr,
            "co2_transport": plan.estimated_co2_kg,
            "route": route_coords
        }

    except Exception as e:
        logger.exception("Logistics failed")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# NEW ENDPOINTS FOR FIVE INTEGRATED AGENTS
# ==============================================================================

class ChatMessageRequest(BaseModel):
    message: str
    lang: Optional[str] = "English"

@app.post("/api/chat")
async def chat_endpoint(req: ChatMessageRequest):
    try:
        # 1. Parse intent & entities
        parsed = chatbot_engine.parse_message(req.message)
        intent = parsed.get("intent", "general")
        entities = parsed.get("entities", {})

        # Standardize fallback parameters
        material = entities.get("material") or "plastic"
        quantity = entities.get("quantity") or 500.0
        unit = entities.get("unit") or "kg"
        qty_kg = quantity * 1000.0 if unit == "tons" else quantity

        raw_result = {}

        # 2. Run existing agent rules based on intent
        if intent == "analyze" or intent == "impact":
            raw_result = calculate_impact(material, qty_kg)
        elif intent == "pricing":
            pricing_req = EconomicValueRequest(
                waste_profile_id=f"GC-CHAT-{uuid.uuid4().hex[:6].upper()}",
                material=material,
                source_industry="Manufacturing",
                destination_industry="Authorized Recycler",
                purity=95.0,
                quantity_tons=quantity if unit == "tons" else quantity / 1000.0,
                transport_distance_km=150.0
            )
            pricing_res = evaluate_pricing(pricing_req)
            raw_result = pricing_res.model_dump()
        elif intent == "matching":
            match_req = MatchWasteProfile(
                material_name=material,
                material_category="plastic",
                physical_form="solid",
                quantity_value=qty_kg,
                quantity_unit="kg",
                frequency="one_off",
                hazard_class="low"
            )
            match_res = check_resource_matching(match_req)
            raw_result = match_res.model_dump()
        elif intent == "logistics":
            loc = entities.get("location") or "Tiruppur"
            dest = entities.get("destination") or "Chennai"
            plan = calculate_logistics(material, qty_kg, loc, dest)
            raw_result = plan.model_dump()
        elif intent == "compliance":
            comp_req = ComplianceCheckRequest(
                company_name="Tiruppur Textiles",
                material_name=material,
                quantity_kg=qty_kg,
                hazard_class="low"
            )
            comp_res = check_compliance(comp_req)
            raw_result = comp_res.model_dump()
        elif intent == "innovation":
            innov_res = find_innovation_pathways(material, qty_kg)
            raw_result = innov_res.model_dump()
        elif intent == "audit" or intent == "dashboard":
            raw_result = aggregate_company_esg("Tiruppur Textiles")
        else:
            raw_result = {"status": "general query processed by AI"}

        # 3. Generate explanation
        bot_response = chatbot_engine.generate_chat_response(intent, entities, raw_result)

        # 4. Multilingual Translation if target language is not English
        target_lang = req.lang or "English"
        if target_lang.lower() != "english":
            trans_req = TranslateRequest(text=bot_response, target_lang=target_lang)
            trans_res = translation_engine.translate(trans_req)
            bot_response = trans_res.translated_text

        return ChatResponse(
            intent=intent,
            entities=entities,
            response=bot_response
        )
    except Exception as e:
        logger.exception("Chatbot failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/kyc/verify")
def kyc_verify_endpoint(req: KYCVerifyRequest):
    try:
        record = kyc_engine.verify_company(req)
        return record
    except Exception as e:
        logger.exception("KYC verification failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/kyc/history")
def kyc_history_endpoint():
    try:
        return kyc_engine.load_records()
    except Exception as e:
        logger.exception("KYC history fetch failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/pricing/recommendation")
def pricing_recommendation_endpoint(material_type: str = "plastic"):
    try:
        recommendation = pricing_engine.recommend_price(material_type)
        return recommendation
    except Exception as e:
        logger.exception("Pricing recommendation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/carbon/tokenize")
def carbon_tokenize_endpoint(req: TokenizeRequest):
    try:
        cert = carbon_engine.tokenize_credits(req)
        return cert
    except Exception as e:
        logger.exception("Carbon credit tokenization failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/carbon/history")
def carbon_history_endpoint():
    try:
        return carbon_engine.load_certificates()
    except Exception as e:
        logger.exception("Carbon certificates list failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/carbon/certificate/{certificate_id}")
def carbon_certificate_pdf_endpoint(certificate_id: str):
    try:
        filename = carbon_engine.generate_pdf_certificate(certificate_id)
        if not filename:
            raise HTTPException(status_code=404, detail="Certificate not found")
        
        pdf_path = os.path.join(REPORTS_DIR, filename)
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=filename
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Certificate download failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/translate")
def translate_endpoint(req: TranslateRequest):
    try:
        res = translation_engine.translate(req)
        return res
    except Exception as e:
        logger.exception("Translation endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# NEW ENDPOINTS FOR INTELLECTUAL AGENTS 10-13
# ==============================================================================

@app.get("/api/demand-forecast")
def get_demand_forecast(material: str = "plastic", industry: str = "packaging"):
    try:
        res = demand_forecasting_engine.get_forecast(material, industry)
        return res
    except Exception as e:
        logger.exception("Demand forecasting endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict-waste")
def predict_corporate_waste(req: WastePredictionRequest):
    try:
        res = waste_prediction_engine.predict_future_waste(req.company, req.industry, req.production_volume)
        return res
    except Exception as e:
        logger.exception("Waste prediction endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/schedule-pickup")
def schedule_logistics_pickup(req: SchedulePickupRequest):
    try:
        res = collection_scheduler_engine.schedule_pickup(req)
        return res
    except Exception as e:
        logger.exception("Collection scheduling endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/recycling-capacity")
def get_recycling_capacity(material: str = "plastic", quantity: float = 1000.0, city: str = "Tiruppur"):
    try:
        res = recycling_capacity_engine.find_available_facility(material, quantity, city)
        return res
    except Exception as e:
        logger.exception("Recycling capacity check endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# NEW ENDPOINTS FOR INTELLECTUAL AGENTS 14-17
# ==============================================================================

@app.post("/api/material-quality")
def check_material_quality(req: MaterialQualityRequest):
    try:
        res = material_quality_engine.predict_material_quality(
            req.material_type,
            req.industry,
            req.storage_days,
            req.humidity,
            req.transport_distance
        )
        return res
    except Exception as e:
        logger.exception("Material quality prediction endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/fraud-detection")
def check_transaction_fraud(req: FraudDetectionRequest):
    try:
        res = fraud_detection_engine.detect_fraud(req)
        return res
    except Exception as e:
        logger.exception("Fraud detection endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/esg-benchmark")
def get_esg_benchmarks(company_name: str = "Tiruppur Textiles"):
    try:
        res = esg_benchmarking_engine.benchmark_company(company_name)
        return res
    except Exception as e:
        logger.exception("ESG benchmarking endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/sustainability-advisor")
def get_sustainability_advice(req: SustainabilityAdvisorRequest):
    try:
        res = sustainability_recommendation_engine.generate_sustainability_recommendations(req.company_name)
        return res
    except Exception as e:
        logger.exception("Sustainability advisor endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# TEN COMPLETELY NEW ENTERPRISE AGENT ENDPOINTS (AGENTS 18-27)
# ==============================================================================

@app.post("/api/negotiate")
def run_negotiations(req: NegotiateRequest):
    try:
        res = negotiation_engine.run_negotiation(req)
        return res
    except Exception as e:
        logger.exception("Negotiation endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/smart-contract/generate")
def generate_smart_contract(req: ContractRequest):
    try:
        res = smart_contract_engine.generate_contract_agreement(req)
        return res
    except Exception as e:
        logger.exception("Contract generation endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/smart-contract/download/{contract_id}")
def download_smart_contract(contract_id: str):
    from fastapi.responses import FileResponse
    filename = f"Contract_{contract_id}.pdf"
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "reports", filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Contract agreement file not found")
    return FileResponse(filepath, media_type="application/pdf", filename=filename)


@app.post("/api/insurance-risk")
def calculate_insurance_threat(req: RiskAssessmentRequest):
    try:
        res = insurance_risk_engine.assess_shipment_risk(req)
        return res
    except Exception as e:
        logger.exception("Insurance risk endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/circular-roi")
def calculate_projected_roi(req: ROIRequest):
    try:
        res = circular_roi_engine.calculate_project_roi(req)
        return res
    except Exception as e:
        logger.exception("Circular ROI endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/waste-auction/bid")
def bid_waste_auction(req: BidRequest):
    try:
        res = waste_auction_engine.run_simulated_auction(req)
        return res
    except Exception as e:
        logger.exception("Waste auction endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/industrial-collaboration")
def get_industrial_collaboration_network():
    try:
        res = industrial_collaboration_engine.get_synergy_networks()
        return res
    except Exception as e:
        logger.exception("Industrial collaboration endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sustainability-reputation")
def get_reputation_index(company_name: str = "Tiruppur Textiles"):
    try:
        res = sustainability_reputation_engine.get_reputation_profile(company_name)
        return res
    except Exception as e:
        logger.exception("Reputation index endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/supply-risk")
def get_supply_risk_index(material: str = "plastic"):
    try:
        res = circular_supply_risk_engine.predict_supply_risk(material)
        return res
    except Exception as e:
        logger.exception("Supply risk endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/traceability/{passport_id}")
def get_traceability_ledger(passport_id: str):
    try:
        res = traceability_engine.get_passport_timeline(passport_id)
        return res
    except Exception as e:
        logger.exception("Traceability passport endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/traceability/checkpoint")
def add_traceability_checkpoint(req: CheckpointRequest):
    try:
        res = traceability_engine.add_custody_checkpoint(req)
        return res
    except Exception as e:
        logger.exception("Checkpoint registry endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/circular-investment")
def prioritize_capital_investments(req: InvestmentRequest):
    try:
        res = circular_investment_engine.get_investment_recommendation(req)
        return res
    except Exception as e:
        logger.exception("Investment priority endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/supplier-reliability")
def get_supplier_reliability_audit(supplier_id: str):
    try:
        res = supplier_reliability_engine.get_supplier_reliability(supplier_id)
        return res
    except Exception as e:
        logger.exception("Supplier reliability endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/circular-design")
def advise_circular_design(req: CircularDesignRequest):
    try:
        res = circular_design_engine.recommend_circular_design(req)
        return res
    except Exception as e:
        logger.exception("Circular design endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/energy-optimization")
def get_energy_shift_advisory(plant: str, equipment: str):
    try:
        res = energy_optimization_engine.get_energy_forecast(plant, equipment)
        return res
    except Exception as e:
        logger.exception("Energy optimization endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/emissions")
def get_emissions_violations_audit(facility: str):
    try:
        res = emission_monitoring_engine.get_emissions_audit(facility)
        return res
    except Exception as e:
        logger.exception("Emissions monitoring endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/hazard-classification")
def classify_waste_hazardous_msds(req: HazardClassificationRequest):
    try:
        res = hazard_classification_engine.classify_waste_hazard(req)
        return res
    except Exception as e:
        logger.exception("Hazard classification endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/resource-availability")
def get_resource_shortage_levels(city: str, material: str):
    try:
        res = resource_availability_engine.get_regional_resource_availability(city, material)
        return res
    except Exception as e:
        logger.exception("Resource availability endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/circular-procurement")
def advise_circular_procurements(req: ProcurementRequest):
    try:
        res = circular_procurement_engine.recommend_circular_procurement(req)
        return res
    except Exception as e:
        logger.exception("Circular procurement endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/facility-expansion")
def advise_facility_expansion_site():
    try:
        res = facility_expansion_engine.get_expansion_advisory()
        return res
    except Exception as e:
        logger.exception("Facility expansion endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/workforce-optimization")
def get_workforce_shift_advisory(plant: str):
    try:
        res = workforce_optimization_engine.get_workforce_schedule(plant)
        return res
    except Exception as e:
        logger.exception("Workforce optimization endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/circular-policy")
def advise_compliance_roadmap(req: PolicyRequest):
    try:
        res = circular_policy_engine.get_policy_advisory(req)
        return res
    except Exception as e:
        logger.exception("Circular policy advisor endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))




