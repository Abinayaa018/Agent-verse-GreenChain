import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import WasteAnalysis from './pages/WasteAnalysis';
import Marketplace from './pages/Marketplace';
import ResourceMatching from './pages/ResourceMatching';
import EnvironmentalImpact from './pages/EnvironmentalImpact';
import EconomicValue from './pages/EconomicValue';
import Compliance from './pages/Compliance';
import CircularInnovation from './pages/CircularInnovation';
import AuditReports from './pages/AuditReports';
import HistoryPage from './pages/History';
import SettingsPage from './pages/Settings';
import Logistics from './pages/Logistics';

// New Integrated Intelligent Agents
import ChatbotPage from './pages/ChatbotPage';
import KYCVerification from './pages/KYCVerification';
import MarketPricingDashboard from './pages/MarketPricingDashboard';
import CarbonCredits from './pages/CarbonCredits';
import LanguageSettings from './pages/LanguageSettings';

// New Agent Pages 10-13
import DemandForecast from './pages/DemandForecast';
import WastePrediction from './pages/WastePrediction';
import CollectionScheduler from './pages/CollectionScheduler';
import RecyclerCapacity from './pages/RecyclerCapacity';

// New Agent Pages 14-17
import MaterialQuality from './pages/MaterialQuality';
import FraudDetection from './pages/FraudDetection';
import ESGBenchmark from './pages/ESGBenchmark';
import SustainabilityAdvisor from './pages/SustainabilityAdvisor';

// Ten completely new enterprise agent pages (Agents 18-27)
import NegotiationPage from './pages/NegotiationPage';
import SmartContractPage from './pages/SmartContractPage';
import InsuranceRiskPage from './pages/InsuranceRiskPage';
import CircularROIPage from './pages/CircularROIPage';
import WasteAuctionPage from './pages/WasteAuctionPage';
import IndustrialCollaborationPage from './pages/IndustrialCollaborationPage';
import ReputationProfilePage from './pages/ReputationProfilePage';
import SupplyRiskPage from './pages/SupplyRiskPage';
import WasteTraceabilityPage from './pages/WasteTraceabilityPage';
import CircularInvestmentPage from './pages/CircularInvestmentPage';

import { AnalysisResponse } from './types';

export const App: React.FC = () => {
  const [currentCompany, setCurrentCompany] = useState('Tiruppur Textiles');
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResponse | null>(null);

  const handleAnalysisSuccess = (res: AnalysisResponse) => {
    setLatestAnalysis(res);
  };

  const handleCompanyChange = (company: string) => {
    setCurrentCompany(company);
    setLatestAnalysis(null); // clear cached analysis when swapping company context
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page (no Sidebar/Navbar) */}
        <Route path="/" element={<LandingPage />} />

        {/* Operational Platform Pages with DashboardLayout */}
        <Route
          element={
            <DashboardLayout
              currentCompany={currentCompany}
              onCompanyChange={handleCompanyChange}
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard company={currentCompany} />} />
          <Route
            path="/waste-analysis"
            element={
              <WasteAnalysis
                company={currentCompany}
                onAnalysisSuccess={handleAnalysisSuccess}
              />
            }
          />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route
            path="/resource-matching"
            element={
              <ResourceMatching
                latestAnalysis={latestAnalysis}
                company={currentCompany}
              />
            }
          />
          <Route
            path="/environmental-impact"
            element={
              <EnvironmentalImpact
                latestAnalysis={latestAnalysis}
                company={currentCompany}
              />
            }
          />
          <Route
            path="/economic-value"
            element={
              <EconomicValue
                latestAnalysis={latestAnalysis}
                company={currentCompany}
              />
            }
          />
          <Route path="/logistics" element={<Logistics />} />
          <Route
            path="/compliance"
            element={
              <Compliance
                latestAnalysis={latestAnalysis}
                company={currentCompany}
              />
            }
          />
          <Route
            path="/circular-innovation"
            element={
              <CircularInnovation
                latestAnalysis={latestAnalysis}
                company={currentCompany}
              />
            }
          />
          <Route path="/audit-reports" element={<AuditReports company={currentCompany} />} />
          <Route path="/history" element={<HistoryPage company={currentCompany} />} />
          
          {/* New Intelligent Agent Routes */}
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/kyc" element={<KYCVerification />} />
          <Route path="/pricing" element={<MarketPricingDashboard />} />
          <Route path="/carbon-credits" element={<CarbonCredits />} />
          <Route path="/language-settings" element={<LanguageSettings />} />

          {/* New Agents 10-13 Routes */}
          <Route path="/demand-forecast" element={<DemandForecast />} />
          <Route path="/waste-prediction" element={<WastePrediction />} />
          <Route path="/collection-scheduler" element={<CollectionScheduler />} />
          <Route path="/recycling-capacity" element={<RecyclerCapacity />} />

          {/* New Agents 14-17 Routes */}
          <Route path="/material-quality" element={<MaterialQuality />} />
          <Route path="/fraud-detection" element={<FraudDetection />} />
          <Route path="/esg-benchmark" element={<ESGBenchmark company={currentCompany} />} />
          <Route path="/sustainability-advisor" element={<SustainabilityAdvisor company={currentCompany} />} />

          {/* Ten completely new enterprise agent routes (Agents 18-27) */}
          <Route path="/negotiation" element={<NegotiationPage />} />
          <Route path="/smart-contract" element={<SmartContractPage />} />
          <Route path="/insurance-risk" element={<InsuranceRiskPage />} />
          <Route path="/circular-roi" element={<CircularROIPage />} />
          <Route path="/waste-auction" element={<WasteAuctionPage />} />
          <Route path="/industrial-collaboration" element={<IndustrialCollaborationPage />} />
          <Route path="/reputation-profile" element={<ReputationProfilePage company={currentCompany} />} />
          <Route path="/supply-risk" element={<SupplyRiskPage />} />
          <Route path="/waste-traceability" element={<WasteTraceabilityPage />} />
          <Route path="/circular-investment" element={<CircularInvestmentPage />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;
