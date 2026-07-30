import React, { useState } from 'react';
import axios from 'axios';
import { Send, ShieldCheck, ShieldAlert, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

interface SupplierData {
  reliability_score: number;
  predicted_risk: string;
  trust_level: string;
  recommended_suppliers: string[];
  confidence: number;
}

export const SupplierReliability: React.FC = () => {
  const [supplierId, setSupplierId] = useState('GC-SUP-1015');
  const [data, setData] = useState<SupplierData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/supplier-reliability`, {
        params: { supplier_id: supplierId }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run supplier reliability check:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Search Input */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#3FE6A8]" />
            SUPPLIER TRUST
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Analyze past delivery delays, order fulfillments, and contract compliance logs to forecast reliability class.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Supplier Code ID</label>
            <input
              type="text"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Analyzing XGBoost..." : "Evaluate Reliability"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Audit display */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No supplier trust records evaluated. Propose a supplier code to audit.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Score indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Reliability Score</span>
                <h3 className="text-3xl font-black text-[#3FE6A8]">{data.reliability_score}%</h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Risk Level</span>
                <span className={`text-xl font-black uppercase ${
                  data.predicted_risk === 'HIGH' ? 'text-red-400' : 'text-[#3FE6A8]'
                }`}>{data.predicted_risk} RISK</span>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Trust Grade</span>
                <h3 className="text-2xl font-black text-[#30D5FF]">{data.trust_level}</h3>
              </div>
            </div>

            {/* Recommendations alternative suppliers card */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#30D5FF]" /> Recommended Alternative Suppliers</span>
              <div className="flex flex-col gap-2.5">
                {data.recommended_suppliers.map((rec, idx) => (
                  <div key={idx} className="p-3.5 rounded-[12px] bg-[#081318]/40 border border-[#1B3A38]/20 flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-[#F5F7FA]">{rec}</span>
                    <span className="text-[10px] font-mono text-[#3FE6A8] font-bold flex items-center gap-1 cursor-pointer hover:underline">Select Supplier <ArrowRight className="w-3 h-3" /></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Model stats */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /> Model Accuracy Confidence</span>
              <p className="text-xs text-[#B9C4CC] font-bold">XGBoost classifier cross-validation score is currently {(data.confidence * 100).toFixed(0)}%.</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default SupplierReliability;
