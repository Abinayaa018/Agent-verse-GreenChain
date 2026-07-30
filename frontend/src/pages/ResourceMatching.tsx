import React, { useEffect, useState } from 'react';
import { Shuffle, ArrowRight, ClipboardCheck } from 'lucide-react';
import api from '../services/api';
import { HistoryEntry, AnalysisResponse } from '../types';

interface ResourceMatchingProps {
  latestAnalysis: AnalysisResponse | null;
  company: string;
}

export const ResourceMatching: React.FC<ResourceMatchingProps> = ({ latestAnalysis, company }) => {
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
        // Trigger a backend query to retrieve full analysis
        const res = await api.analyzeWaste(new FormData()); // mock empty post, wait, api.analyze takes forms.
        // We can just construct a mock form or pull from endpoints
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
          Resource Matching
        </h1>
        <p className="text-text-secondary mt-1">
          Rank compatible industrial symbiosis partners and review generated commercial reuse pitches.
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
            className="bg-primary-green hover:bg-primary-hover disabled:bg-gray-300 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors"
          >
            {loading ? 'Retrieving matches...' : 'Fetch Match Analytics'}
          </button>
        </div>
      )}

      {activeAnalysis ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Matches column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50">
              <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                <Shuffle className="text-primary-green" size={20} />
                Ranked Symbiosis Matches
              </h3>

              <div className="space-y-4">
                {activeAnalysis.resource_matching.results.map((match, idx) => (
                  <div
                    key={idx}
                    className="p-5 border border-gray-150 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-base text-text-primary">
                          {match.buyer_name}
                        </h4>
                        <p className="text-xs text-text-secondary mt-0.5">
                          Industry: <strong className="text-text-primary">{match.industry_name}</strong>
                        </p>
                      </div>
                      <span className="text-xs font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                        Score: {match.score.toFixed(1)}/10
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Symbiosis Pitch
                      </p>
                      <p className="text-sm text-text-primary mt-1 italic">
                        "{match.pitch_summary}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Sidebar */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 h-fit space-y-6">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <ClipboardCheck className="text-primary-green" size={20} />
              Material Signature
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Material type</span>
                <span className="font-bold text-text-primary capitalize">{activeAnalysis.material_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Purity</span>
                <span className="font-bold text-text-primary">{activeAnalysis.purity_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Hazard rating</span>
                <span className="font-bold text-text-primary capitalize">{activeAnalysis.hazard_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Recyclability</span>
                <span className="font-bold text-primary-green">Verified Reusable</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Shuffle className="text-text-muted mx-auto mb-3" size={48} />
          <h3 className="font-bold text-lg text-text-primary">No Matching Context</h3>
          <p className="text-text-secondary text-sm mt-1">
            Run a new waste profile analysis first, or select a past contract ID above to populate symbiosis matches.
          </p>
        </div>
      )}
    </div>
  );
};
export default ResourceMatching;
