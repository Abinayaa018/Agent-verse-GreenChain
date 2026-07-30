export interface EnvironmentalImpact {
  co2_saved_kg: number;
  landfill_diverted_kg: number;
  circularity_score: number;
}

export interface EconomicValue {
  estimated_price: number;
  price_range: string;
  demand_score: number;
  processing_cost: number;
  transport_cost: number;
  revenue: number;
  total_cost: number;
  net_profit: number;
  roi_percent: number;
  profitability: string;
  recommendation: string;
}

export interface ResourceMatch {
  buyer_name: string;
  industry_name: string;
  score: number;
  pitch_summary: string;
}

export interface ResourceMatchingPayload {
  results: ResourceMatch[];
  total_found: number;
}

export interface CompliancePayload {
  is_compliant: boolean;
  status: "PASS" | "FAIL";
  compliance_score: number;
  confidence: number;
  violations: string[];
  warnings: string[];
  regulations_applied: string[];
  required_permits: string[];
  required_documents: string[];
  recommendations: string[];
}

export interface CircularDiscovery {
  innovation_id: string;
  title: string;
  transformation_pathway: string;
  trl_level: number;
  trl_description: string;
  novelty_index: string;
  score: number;
  environmental_benefits: string[];
  industrial_benefits: string[];
}

export interface CircularInnovationPayload {
  query_material: string;
  material_category: string;
  discoveries: CircularDiscovery[];
}

export interface AnalysisResponse {
  waste_profile_id: string;
  material_type: string;
  purity_pct: number;
  hazard_level: string;
  reusable: boolean;
  confidence: number;
  description: string;
  environmental_impact: EnvironmentalImpact;
  economic_value: EconomicValue;
  resource_matching: ResourceMatchingPayload;
  compliance: CompliancePayload;
  circular_innovation: CircularInnovationPayload;
  contract_id: string;
}

export interface HistoryEntry {
  contract_id: string;
  material_type: string;
  quantity_kg: number;
  co2_saved_kg: number;
  landfill_diverted_kg: number;
  timestamp: string;
}

export interface ChartData {
  month: string;
  co2: number;
  diverted: number;
  waste: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
}

export interface DashboardResponse {
  total_waste_processed: number;
  revenue_generated: number;
  co2_saved: number;
  landfill_diverted: number;
  circularity_score: number;
  marketplace_matches: number;
  recent_analyses: HistoryEntry[];
  charts: {
    monthly_trend: ChartData[];
    category_breakdown: CategoryBreakdown[];
  };
}

export interface CompanyRank {
  company_name: string;
  trust_score: number;
  completed_transactions: number;
  is_verified: boolean;
}

export interface MarketplaceListing {
  id: string;
  material: string;
  quantity: string;
  price: string;
  seller: string;
  status: string;
}

export interface MarketplaceResponse {
  companies: CompanyRank[];
  listings: MarketplaceListing[];
}

export interface ESGReport {
  filename: string;
  created_at: string;
  size_bytes: number;
}

export interface LocationInfo {
  name: string;
  lat: number;
  lng: number;
}

export interface LogisticsResponse {
  origin: LocationInfo;
  destination: LocationInfo;
  distance_km: number;
  duration_minutes: number;
  vehicle: string;
  transport_cost: number;
  co2_transport: number;
  route: [number, number][];
}
