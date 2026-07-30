import React, { useState } from 'react';
import axios from 'axios';
import { Send, Users, Sparkles, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';

interface WorkforceData {
  staff_allocation: { [key: string]: number };
  recommended_shifts: string[];
  productivity_forecast: number;
  idle_workforce: number;
}

export const WorkforceOptimization: React.FC = () => {
  const [plant, setPlant] = useState('Tiruppur Weaving Plant');
  const [data, setData] = useState<WorkforceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/workforce-optimization`, {
        params: { plant }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run workforce optimization:', err);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3FE6A8]" />
            SHIFT PLANNER
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Balance staffing levels across plant shifts to optimize baseline productivity factors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Plant Location</label>
            <select
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {plants.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Consulting Random Forest..." : "Optimize Staffing"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <Users className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No workforce schedules optimized. Select a target plant site and run.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Forecast KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><TrendingUp className="w-4 h-4 text-[#3FE6A8]" /> Productivity Forecast</span>
                <h3 className="text-3xl font-black text-[#3FE6A8]">{data.productivity_forecast}%</h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-purple-400" /> Idle Redundant Headcount</span>
                <h3 className="text-3xl font-black text-purple-400">{data.idle_workforce} <span className="text-xs text-[#6F8088]">workers</span></h3>
              </div>
            </div>

            {/* Shift Headcount allocation map */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Users className="w-4 h-4 text-[#30D5FF]" /> Shift Headcount Allocation</span>
              <div className="flex flex-col gap-2.5">
                {Object.entries(data.staff_allocation).map(([shift, count]) => (
                  <div key={shift} className="p-3.5 rounded-[12px] bg-[#081318]/40 border border-[#1B3A38]/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-[#F5F7FA]">{shift}</span>
                    <span className="text-xs font-mono text-[#3FE6A8] font-bold">{count} personnel</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations checklist */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#3FE6A8]" /> Workforce Shift Actions</span>
              <div className="flex flex-col gap-2.5 pl-3 border-l border-[#1B3A38]/30">
                {data.recommended_shifts.map((rec, idx) => (
                  <div key={idx} className="flex gap-2 items-center text-xs text-[#B9C4CC] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8]" />
                    <span>{rec}</span>
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
export default WorkforceOptimization;
