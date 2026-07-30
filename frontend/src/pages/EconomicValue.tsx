import React, { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, Info, DollarSign, Wallet } from 'lucide-react';
import api from '../services/api';
import { HistoryEntry, AnalysisResponse } from '../types';

interface EconomicValueProps {
  latestAnalysis: AnalysisResponse | null;
  company: string;
}

export const EconomicValue: React.FC<EconomicValueProps> = ({ latestAnalysis, company }) => {
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
          Economic Valuation
        </h1>
        <p className="text-text-secondary mt-1">
          Review estimated pricing benchmarks, demand matrices, processing cost splits, and return on investment forecasts.
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
            {loading ? 'Retrieving valuation...' : 'Fetch Financial Analytics'}
          </button>
        </div>
      )}

      {activeAnalysis ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Financial breakdown card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50">
              <h3 className="font-bold text-lg text-text-primary mb-6 flex items-center gap-2">
                <Wallet className="text-primary-green" size={20} />
                Transaction Valuation Sheet
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-50 pb-3 text-sm">
                  <span className="text-text-secondary">Base Market Price (per ton)</span>
                  <span className="font-bold text-text-primary">₹{activeAnalysis.economic_value.estimated_price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-3 text-sm">
                  <span className="text-text-secondary">Price Range Range</span>
                  <span className="font-bold text-text-primary">{activeAnalysis.economic_value.price_range}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-3 text-sm">
                  <span className="text-text-secondary">Estimated Raw Revenue</span>
                  <span className="font-bold text-primary-green">₹{activeAnalysis.economic_value.revenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-3 text-sm">
                  <span className="text-text-secondary">Processing Cost Split</span>
                  <span className="font-bold text-danger">₹{activeAnalysis.economic_value.processing_cost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-3 text-sm">
                  <span className="text-text-secondary">Est. Transportation Logistics Fee</span>
                  <span className="font-bold text-danger">₹{activeAnalysis.economic_value.transport_cost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-3 text-sm font-bold text-text-primary">
                  <span>Total Overhead Costs</span>
                  <span>₹{activeAnalysis.economic_value.total_cost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-3 text-base font-extrabold text-primary-green">
                  <span>Forecasted Net Profit</span>
                  <span>₹{activeAnalysis.economic_value.net_profit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profitability and recommendation card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 h-fit space-y-6">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <TrendingUp className="text-primary-green" size={20} />
              Feasibility Indices
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
                  Return on Investment
                </span>
                <h4 className="text-3xl font-black text-emerald-600 mt-1">
                  {activeAnalysis.economic_value.roi_percent}%
                </h4>
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 mt-2 capitalize">
                  {activeAnalysis.economic_value.profitability}
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
                <p className="font-bold text-text-primary">Decision Matrix:</p>
                <div className="flex justify-between">
                  <span>Demand score:</span>
                  <span className="font-semibold text-text-primary">{activeAnalysis.economic_value.demand_score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Advice:</span>
                  <span className="font-bold text-emerald-700">{activeAnalysis.economic_value.recommendation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <IndianRupee className="text-text-muted mx-auto mb-3" size={48} />
          <h3 className="font-bold text-lg text-text-primary">No Valuation Context</h3>
          <p className="text-text-secondary text-sm mt-1">
            Run a new waste profile analysis first, or select a past contract ID above to review detailed transaction costs.
          </p>
        </div>
      )}
    </div>
  );
};
export default EconomicValue;
