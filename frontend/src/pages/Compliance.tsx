import React, { useEffect, useState } from 'react';
import { ShieldCheck, Info, AlertTriangle, CheckSquare, FileWarning } from 'lucide-react';
import api from '../services/api';
import { HistoryEntry, AnalysisResponse } from '../types';

interface ComplianceProps {
  latestAnalysis: AnalysisResponse | null;
  company: string;
}

export const Compliance: React.FC<ComplianceProps> = ({ latestAnalysis, company }) => {
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
          Compliance Auditing
        </h1>
        <p className="text-text-secondary mt-1">
          Review regulatory safety standards, identify hazardous permit gaps, and check transaction compliance scores.
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
            {loading ? 'Retrieving compliance...' : 'Fetch Compliance Verification'}
          </button>
        </div>
      )}

      {activeAnalysis ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main results column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50">
              <h3 className="font-bold text-lg text-text-primary mb-6 flex items-center gap-2">
                <CheckSquare className="text-primary-green" size={20} />
                Regulatory Audit Check
              </h3>

              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <span className="text-text-secondary">Safety Verification Status</span>
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full ${
                      activeAnalysis.compliance.status === 'PASS'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {activeAnalysis.compliance.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <span className="text-text-secondary">Engine Compliance Score</span>
                  <span className="font-bold text-text-primary">{activeAnalysis.compliance.compliance_score}%</span>
                </div>

                {activeAnalysis.compliance.violations.length > 0 ? (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs text-rose-800 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <FileWarning size={16} />
                      Violations Flagged:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      {activeAnalysis.compliance.violations.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-800 font-semibold">
                    All compliance parameters matched. No regulatory citations issued.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold text-text-secondary mb-2">Required Licenses & Permits</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeAnalysis.compliance.required_permits.map((p, i) => (
                        <span key={i} className="bg-gray-100 text-text-primary px-2.5 py-1 rounded font-medium">
                          {p.replace('_', ' ').toUpperCase()}
                        </span>
                      ))}
                      {activeAnalysis.compliance.required_permits.length === 0 && (
                        <span className="text-text-muted italic">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-text-secondary mb-2">Required Accompanying Documents</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeAnalysis.compliance.required_documents.map((d, i) => (
                        <span key={i} className="bg-gray-100 text-text-primary px-2.5 py-1 rounded font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar recommendation */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 h-fit space-y-6">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <ShieldCheck className="text-primary-green" size={20} />
              Accreditation Advice
            </h3>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 space-y-3">
                <p className="font-bold text-text-primary">Guidelines to Proceed:</p>
                <ul className="list-disc pl-4 space-y-2 text-text-secondary">
                  {activeAnalysis.compliance.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 text-text-muted leading-relaxed">
                <Info size={16} className="text-deep-emerald flex-shrink-0 mt-0.5" />
                <p>
                  Compliance checks run on a hybrid rule network containing standard CPCB (Central Pollution Control Board) safety mandates.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <ShieldCheck className="text-text-muted mx-auto mb-3" size={48} />
          <h3 className="font-bold text-lg text-text-primary">No Compliance Context</h3>
          <p className="text-text-secondary text-sm mt-1">
            Run a new waste profile analysis first, or select a past contract ID above to execute a regulatory check.
          </p>
        </div>
      )}
    </div>
  );
};
export default Compliance;
