import React, { useState } from 'react';
import axios from 'axios';
import { Send, MapPin, Sparkles, DollarSign, Award, Leaf } from 'lucide-react';

interface ExpansionData {
  recommended_city: string;
  roi: number;
  expected_throughput: number;
  environmental_benefit: string;
}

export const FacilityExpansion: React.FC = () => {
  const [data, setData] = useState<ExpansionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAudit = async () => {
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/facility-expansion`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to run facility expansion site selection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameters Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#3FE6A8]" />
            SITE SELECTION
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Identify the optimal geographic city for establishing new regional recycling facilities using ensembled XGBoost forecasting.
          </p>
        </div>

        <button
          onClick={handleAudit}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
        >
          {isLoading ? "Running location models..." : "Evaluate Site Feasibility"}
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <MapPin className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No location feasibility audits run. Click check button to execute.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Best candidate highlight */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[130px]">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-[#3FE6A8]/5 blur-[30px] pointer-events-none" />
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Award className="w-4 h-4 text-[#3FE6A8]" /> Top Recommended Site</span>
              <div>
                <h3 className="text-2xl font-black text-[#F5F7FA] mt-1">{data.recommended_city}</h3>
                <p className="text-xs text-[#3FE6A8] mt-1 font-bold">Optimal waste feedstock and land tariff levels matching criteria.</p>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><DollarSign className="w-4 h-4 text-[#3FE6A8]" /> Projected Facility ROI</span>
                <h3 className="text-3xl font-black text-[#3FE6A8]">{data.roi}%</h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Leaf className="w-4 h-4 text-[#30D5FF]" /> Expected Throughput</span>
                <h3 className="text-2xl font-black text-[#30D5FF]">{data.expected_throughput.toLocaleString()} <span className="text-xs text-[#6F8088]">tons/yr</span></h3>
              </div>
            </div>

            {/* Environmental benefit advisory card */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3 relative overflow-hidden">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Landfill Diversion Benefit</span>
              <p className="text-xs text-[#B9C4CC] leading-relaxed font-bold italic">
                "{data.environmental_benefit}"
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default FacilityExpansion;
