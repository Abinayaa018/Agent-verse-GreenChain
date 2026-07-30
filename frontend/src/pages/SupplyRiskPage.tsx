import React, { useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Send, AlertTriangle, ShieldCheck, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';

interface SupplyData {
  supply_risk_index: number;
  scarcity_score: number;
  alternative_suppliers: string[];
  risk_timeline: number[];
}

export const SupplyRiskPage: React.FC = () => {
  const [material, setMaterial] = useState('plastic');
  const [data, setData] = useState<SupplyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/supply-risk`, {
        params: { material }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to predict material supply risk:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const materials = ["plastic", "metal", "battery", "paper", "textile"];

  // Compile timeline for Recharts LineChart
  const getTimelineData = (timeline: number[]) => {
    const months = ['Month +1', 'Month +2', 'Month +3', 'Month +4', 'Month +5', 'Month +6'];
    return timeline.map((val, idx) => ({
      month: months[idx],
      risk: val
    }));
  };

  const chartData = data ? getTimelineData(data.risk_timeline) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameters Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#3FE6A8]" />
            SUPPLY DISRUPTION FORECAST
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Predict supply stutters, raw material scarcity, and alternative logistics channels using time-series regressions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Commodity Class</label>
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
            {isLoading ? "Running prophet forecasts..." : "Forecast Scarcity Volatility"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No active predictions. Run parameters to check scarcity indexes.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Volatility profiles cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Supply Risk Index</span>
                <h3 className={`text-3xl font-black ${data.supply_risk_index >= 6.5 ? 'text-red-400' : 'text-[#3FE6A8]'}`}>
                  {data.supply_risk_index} <span className="text-xs text-[#6F8088]">/10</span>
                </h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Scarcity Score</span>
                <h3 className="text-3xl font-black text-[#30D5FF]">{data.scarcity_score} <span className="text-xs text-[#6F8088]">/10</span></h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Disruption Class</span>
                <span className={`text-sm font-black uppercase ${
                  data.supply_risk_index >= 6.5 ? 'text-red-400' : 'text-[#3FE6A8]'
                }`}>{data.supply_risk_index >= 6.5 ? 'HIGH RISK' : 'STABLE SUPPLY'}</span>
              </div>
            </div>

            {/* Alternative suppliers suggested */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-[#3FE6A8]" /> Suggested Alternate Supply Nodes</span>
              <div className="flex flex-col gap-2.5">
                {data.alternative_suppliers.map((sup, idx) => (
                  <div key={idx} className="p-3.5 rounded-[12px] bg-[#081318]/40 border border-[#1B3A38]/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-[#F5F7FA]">{sup}</span>
                    <span className="text-[10px] font-mono text-[#3FE6A8] uppercase tracking-wider font-bold">Verified seller</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6-month monthly projections chart */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> 6-Month Supply Volatility Trend Index
              </span>

              <div className="h-[200px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 58, 56, 0.1)" />
                    <XAxis dataKey="month" stroke="#6F8088" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#6F8088" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#061016',
                        borderColor: '#1B3A38',
                        borderRadius: '12px',
                        color: '#F5F7FA',
                        fontSize: '11px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="risk"
                      name="Risk Level"
                      stroke="#EF4444"
                      strokeWidth={2.5}
                      dot={{ fill: '#EF4444' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default SupplyRiskPage;
