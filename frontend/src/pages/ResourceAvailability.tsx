import React, { useState } from 'react';
import axios from 'axios';
import { Send, Shuffle, HelpCircle, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

interface ResourceData {
  availability: number;
  shortage_risk: 'STABLE' | 'LOW_RISK' | 'CRITICAL';
  surplus: number;
  future_availability: number;
}

export const ResourceAvailability: React.FC = () => {
  const [city, setCity] = useState('Tiruppur');
  const [material, setMaterial] = useState('plastic');
  const [data, setData] = useState<ResourceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/resource-availability`, {
        params: { city, material }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run resource availability check:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const cities = ["Tiruppur", "Coimbatore", "Chennai", "Salem", "Erode"];
  const materials = ["plastic", "metal", "battery", "paper", "textile"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-[#3FE6A8]" />
            REGIONAL RESOURCES
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Monitor current raw recyclable volumes and predict future shortage risks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Geographic City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Material Class</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {materials.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Analyzing Random Forest..." : "Verify Regional volumes"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No availability ledger metrics queried. Select query inputs and execute.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* KPI metrics row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Local Volume</span>
                <h3 className="text-xl font-black text-[#F5F7FA]">{data.availability} <span className="text-[10px] text-[#6F8088]">tons</span></h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Shortage Threat</span>
                <h3 className={`text-lg font-black uppercase ${
                  data.shortage_risk === 'CRITICAL' ? 'text-red-400' : 'text-[#3FE6A8]'
                }`}>{data.shortage_risk}</h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Overcapacity Surplus</span>
                <h3 className="text-xl font-black text-[#30D5FF]">{data.surplus} <span className="text-[10px] text-[#6F8088]">tons</span></h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Month +1 forecast</span>
                <h3 className="text-xl font-black text-purple-400">{data.future_availability} <span className="text-[10px] text-[#6F8088]">tons</span></h3>
              </div>
            </div>

            {/* Model status alert */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /> Sourcing Guidelines</span>
              <p className="text-xs text-[#B9C4CC] font-semibold leading-relaxed">
                {data.shortage_risk === 'CRITICAL' 
                  ? "Sourcing lines are highly constrained. We advise setting imports triggers from neighboring sorting zones immediately." 
                  : "Sourcing volumes are currently matching factory capacity constraints. Maintain baseline purchase schedules."
                }
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default ResourceAvailability;
