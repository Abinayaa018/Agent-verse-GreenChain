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

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;
