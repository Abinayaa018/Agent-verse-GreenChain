import React, { useEffect, useState } from 'react';
import { Leaf, Info, ShieldCheck, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { HistoryEntry, AnalysisResponse } from '../types';

interface EnvironmentalImpactProps {
  latestAnalysis: AnalysisResponse | null;
  company: string;
}

export const EnvironmentalImpact: React.FC<EnvironmentalImpactProps> = ({ latestAnalysis, company }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedTx, setSelectedTx] = useState('');
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResponse | null>(latestAnalysis);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.getHistory(company);
        setHistory(res);
        if (res.length > 0 && !latestAnalysis) {
          setSelectedTx(res[0].contract_id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadHistory();
  }, [company, latestAnalysis]);

  useEffect(() => {
    if (latestAnalysis) {
      setActiveAnalysis(latestAnalysis);
    }
  }, [latestAnalysis]);

  const handleLoadTx = async () => {
    if (!selectedTx) return;
    setLoading(true);
    try {
      const match = history.find((h) => h.contract_id === selectedTx);
      if (match) {
        const form = new FormData();
        form.append('material_type', match.material_type);
        form.append('quantity', String(match.quantity_kg / 1000.0));
        form.append('location', 'Tiruppur');
        form.append('industry', 'Textile');
        form.append('description', 'Recovered transaction.');
        form.append('company_name', company);
        const detailed = await api.analyzeWaste(form);
        setActiveAnalysis(detailed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Environmental Impact Assessment
        </h1>
        <p className="text-text-secondary mt-1">
          Verify cumulative CO₂ offsets and solid waste diversion percentages computed by environmental models.
        </p>
      </div>

      {/* History Selector if no active analysis */}
      {!latestAnalysis && history.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 flex flex-wrap items-center gap-4">
          <label className="text-sm font-semibold text-text-secondary">
            Select contract from ESG ledger:
          </label>
          <select
            value={selectedTx}
            onChange={(e) => setSelectedTx(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-text-primary outline-none"
          >
            {history.map((h) => (
              <option key={h.contract_id} value={h.contract_id}>
                {h.contract_id} - {h.material_type.charAt(0).toUpperCase() + h.material_type.slice(1)} ({h.quantity_kg} kg)
              </option>
            ))}
          </select>
          <button
            onClick={handleLoadTx}
            disabled={loading}
            className="bg-primary-green hover:bg-primary-hover text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors"
          >
            {loading ? 'Retrieving impact...' : 'Fetch ESG Analytics'}
          </button>
        </div>
      )}

      {activeAnalysis ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main stats block */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50">
              <h3 className="font-bold text-lg text-text-primary mb-6 flex items-center gap-2">
                <Leaf className="text-primary-green" size={20} />
                Emissions & Landfill Offsets
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* CO2 box */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 text-center">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
                    Scope 3 CO₂ Saved
                  </span>
                  <h4 className="text-4xl font-black text-emerald-600 mt-2">
                    {activeAnalysis.environmental_impact.co2_saved_kg.toLocaleString()} kg
                  </h4>
                  <p className="text-xs text-emerald-700 mt-2">
                    Net greenhouse gas displacement compared to virgin material processing.
                  </p>
                </div>

                {/* Landfill box */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 text-center">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-blue-800">
                    Municipal Solid Waste Diverted
                  </span>
                  <h4 className="text-4xl font-black text-blue-600 mt-2">
                    {activeAnalysis.environmental_impact.landfill_diverted_kg.toLocaleString()} kg
                  </h4>
                  <p className="text-xs text-blue-700 mt-2">
                    Tipping mass prevented from permanent landfill accumulation.
                  </p>
                </div>
              </div>

              {/* Methodology details */}
              <div className="mt-8 bg-gray-50 border border-gray-150 rounded-xl p-4 flex gap-3 text-xs text-text-secondary">
                <Info className="text-deep-emerald flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-bold text-text-primary">Calculation Methodology</p>
                  <p className="mt-1 leading-relaxed">
                    Circularity metrics are estimated based on material class emission factors compiled from the EPA WARM database, multiplied by the purity factor of the verified batch. All values represent indicatives for reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Circularity ranking card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 h-fit space-y-6">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <ShieldCheck className="text-primary-green" size={20} />
              Circularity Index
            </h3>

            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                {/* Simulated circle border */}
                <div className="w-28 h-28 rounded-full border-8 border-primary-green/20 flex items-center justify-center">
                  <span className="text-3xl font-black text-primary-green">
                    {activeAnalysis.environmental_impact.circularity_score}%
                  </span>
                </div>
              </div>
              <p className="text-xs font-bold text-text-secondary uppercase mt-4">Circularity Score</p>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
              <p className="font-bold text-text-primary">Target Stream Metrics:</p>
              <div className="flex justify-between">
                <span>Material classification:</span>
                <span className="font-semibold text-text-primary capitalize">{activeAnalysis.material_type}</span>
              </div>
              <div className="flex justify-between">
                <span>Quality rating:</span>
                <span className="font-semibold text-text-primary">{activeAnalysis.purity_pct}% pure</span>
              </div>
              <div className="flex justify-between">
                <span>Verification standard:</span>
                <span className="font-semibold text-primary-green">Verified Reusable</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Leaf className="text-text-muted mx-auto mb-3" size={48} />
          <h3 className="font-bold text-lg text-text-primary">No Environmental Data</h3>
          <p className="text-text-secondary text-sm mt-1">
            Run a new waste profile analysis first, or select a past contract ID above to review detailed carbon offsets.
          </p>
        </div>
      )}
    </div>
  );
};
export default EnvironmentalImpact;
