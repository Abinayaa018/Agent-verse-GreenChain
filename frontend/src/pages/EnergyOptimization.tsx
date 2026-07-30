import React, { useState } from 'react';
import axios from 'axios';
import { Send, Zap, Clock, IndianRupee, HelpCircle, AlertTriangle } from 'lucide-react';

interface EnergyData {
  energy_prediction: number;
  recommended_schedule: string;
  energy_saving: number;
  peak_hours: string[];
  cost_savings: number;
}

export const EnergyOptimization: React.FC = () => {
  const [plant, setPlant] = useState('Tiruppur Weaving Plant');
  const [equipment, setEquipment] = useState('Shredder Mill');
  const [data, setData] = useState<EnergyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/energy-optimization`, {
        params: { plant, equipment }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run energy load forecast:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const plants = [
    "Tiruppur Weaving Plant",
    "Coimbatore Sorting Hub",
    "Chennai Extrusion Center",
    "Salem Compressed Scrap"
  ];

  const equipments = [
    "Shredder Mill",
    "Pelletizer Extruder",
    "Hydraulic Baler",
    "Compactor Press"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#3FE6A8]" />
            LOAD PLANNER
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Optimize machinery load cycles and shift power allocations to cut utility tariff costs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Plant Site</label>
            <select
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {plants.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Machinery Equipment</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {equipments.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Running XGBoost..." : "Compute Load Optimization"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <Zap className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No active energy load schedules. Propose a plant site to run.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Primary KPI row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Energy prediction</span>
                <h3 className="text-3xl font-black text-[#F5F7FA]">{data.energy_prediction} <span className="text-xs text-[#6F8088]">kWh</span></h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#3FE6A8]" /> Power Saving</span>
                <h3 className="text-3xl font-black text-[#3FE6A8]">-{data.energy_saving} <span className="text-xs text-[#6F8088]">kWh</span></h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><IndianRupee className="w-4 h-4 text-[#30D5FF]" /> Estimated Savings</span>
                <h3 className="text-2xl font-black text-[#30D5FF]">₹{data.cost_savings.toLocaleString()}</h3>
              </div>
            </div>

            {/* Schedule recommendations */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-400" /> Shift scheduling advisory</span>
              <p className="text-xs text-[#B9C4CC] font-bold leading-relaxed">{data.recommended_schedule}</p>
            </div>

            {/* High Tariff hours */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /> High-Tariff Grid Peak Hours</span>
              <div className="flex flex-col gap-2 pl-3 border-l border-[#1B3A38]/30">
                {data.peak_hours.map((ph, idx) => (
                  <div key={idx} className="flex gap-2 items-center text-xs text-[#B9C4CC] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span>{ph}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default EnergyOptimization;
