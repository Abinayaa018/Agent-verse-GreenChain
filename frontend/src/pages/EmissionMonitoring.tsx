import React, { useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Send, AlertTriangle, ShieldCheck, Sparkles, ShieldAlert, BarChart } from 'lucide-react';

interface TrendItem {
  time: string;
  co2: number;
  pm: number;
}

interface EmissionData {
  alerts: string[];
  trend: TrendItem[];
  emission_status: 'STABLE' | 'VOLATILE' | 'VIOLATING';
  recommendations: string[];
}

export const EmissionMonitoring: React.FC = () => {
  const [facility, setFacility] = useState('Tiruppur Textiles');
  const [data, setData] = useState<EmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/emissions`, {
        params: { facility }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run emissions audit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const facilities = [
    "Tiruppur Textiles",
    "EcoFibre Ltd",
    "Coimbatore E-Hub",
    "Salem Scrap Yard"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#3FE6A8]" />
            EMISSIONS AUDIT
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Monitor industrial air quality levels, PM2.5 particulates, and flag sensor anomalies using Isolation Forest algorithms.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Industrial Facility</label>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {facilities.map((fac) => <option key={fac} value={fac}>{fac}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Running anomaly forests..." : "Analyze Emissions"}
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
              No active emissions telemetry evaluated. Select a facility and run.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Status card */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex justify-between items-center h-[120px]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Emissions Status</span>
                <h3 className={`text-2xl font-black mt-1 uppercase ${
                  data.emission_status === 'VIOLATING' ? 'text-red-400 animate-pulse' : data.emission_status === 'VOLATILE' ? 'text-amber-400' : 'text-[#3FE6A8]'
                }`}>{data.emission_status}</h3>
              </div>
              <span className={`w-3.5 h-3.5 rounded-full ${
                data.emission_status === 'VIOLATING' ? 'bg-red-400 shadow-[0_0_8px_#F87171]' : data.emission_status === 'VOLATILE' ? 'bg-amber-400' : 'bg-[#3FE6A8]'
              }`} />
            </div>

            {/* Alerts warnings checklist */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /> Active Telemetry Alerts</span>
              <div className="flex flex-col gap-2">
                {data.alerts.map((al, idx) => (
                  <p key={idx} className="text-xs text-[#B9C4CC] font-bold">{al}</p>
                ))}
              </div>
            </div>

            {/* Recommendations checklist */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#3FE6A8]" /> Mitigation Recommendations</span>
              <div className="flex flex-col gap-2.5 pl-3 border-l border-[#1B3A38]/30">
                {data.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-2 items-center text-xs text-[#B9C4CC] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8]" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Area chart trend */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><BarChart className="w-4 h-4 text-[#30D5FF]" /> Telemetry Load Trend</span>
              
              <div className="h-[200px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#30D5FF" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#30D5FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 58, 56, 0.1)" />
                    <XAxis dataKey="time" stroke="#6F8088" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6F8088" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#061016',
                        borderColor: '#1B3A38',
                        borderRadius: '12px',
                        color: '#F5F7FA',
                        fontSize: '11px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="co2"
                      name="CO2 Levels (ppm)"
                      stroke="#30D5FF"
                      fillOpacity={1}
                      fill="url(#colorCO2)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default EmissionMonitoring;
