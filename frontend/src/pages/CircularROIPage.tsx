import React, { useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Send, TrendingUp, DollarSign, Award, Leaf, Calendar, RefreshCw } from 'lucide-react';

interface ROIData {
  roi: number;
  npv: number;
  irr: number;
  payback_period: number;
  annual_savings: number;
  carbon_savings: number;
  profit_increase: number;
}

export const CircularROIPage: React.FC = () => {
  const [investment, setInvestment] = useState('350000');
  const [equipment, setEquipment] = useState('120000');
  const [volume, setVolume] = useState('24000');
  const [labor, setLabor] = useState('20');
  const [energy, setEnergy] = useState('8000');
  const [data, setData] = useState<ROIData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/circular-roi`, {
        investment: parseFloat(investment),
        equipment_cost: parseFloat(equipment),
        recycling_volume_kg: parseFloat(volume),
        labor_hours_per_week: parseFloat(labor),
        energy_savings_kwh: parseFloat(energy)
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run circular ROI simulation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Compile years cash flow projection for AreaChart
  const getChartData = (roiData: ROIData) => {
    const cost = parseFloat(investment) + parseFloat(equipment);
    const flow = roiData.annual_savings - (parseFloat(labor) * 52 * 250);
    return [
      { year: 'Year 0', cash: -cost },
      { year: 'Year 1', cash: Math.round(-cost + flow) },
      { year: 'Year 2', cash: Math.round(-cost + flow * 2) },
      { year: 'Year 3', cash: Math.round(-cost + flow * 3) },
      { year: 'Year 4', cash: Math.round(-cost + flow * 4) },
      { year: 'Year 5', cash: Math.round(roiData.npv) }
    ];
  };

  const chartData = data ? getChartData(data) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Inputs */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#3FE6A8]" />
            CIRCULAR ECONOMY ROI
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Estimate financial viability indicators (NPV, IRR, Payback) and carbon savings offsets using Monte Carlo projections.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Capex Capital Investment (₹)</label>
            <input
              type="number"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Machinery Purchase cost (₹)</label>
            <input
              type="number"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Annual Recycling volume (kg)</label>
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Labor (hrs/wk)</label>
              <input
                type="number"
                value={labor}
                onChange={(e) => setLabor(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Energy Saved (kWh)</label>
              <input
                type="number"
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Running Simulation Paths..." : "Compute Project ROI"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome KPI lists */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <RefreshCw className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              Viability ledger empty. Propose equipment budgets to check cash returns.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Primary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-[#3FE6A8]" /> Project ROI</span>
                <h3 className="text-2xl font-black text-[#3FE6A8]">{data.roi}%</h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-[#30D5FF]" /> Net NPV</span>
                <h3 className="text-xl font-black text-[#F5F7FA] tracking-tight">₹{data.npv.toLocaleString()}</h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-400" /> Internal IRR</span>
                <h3 className="text-2xl font-black text-amber-400">{data.irr}%</h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-purple-400" /> Payback Period</span>
                <h3 className="text-2xl font-black text-purple-400">{data.payback_period} <span className="text-xs text-[#6F8088]">yrs</span></h3>
              </div>
            </div>

            {/* Savings & Carbon row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Annual Savings</span>
                <h3 className="text-2xl font-black text-[#F5F7FA]">₹{data.annual_savings.toLocaleString()}</h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Net Profit Increase</span>
                <h3 className="text-2xl font-black text-[#3FE6A8]">₹{data.profit_increase.toLocaleString()}</h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Leaf className="w-4 h-4 text-[#30D5FF]" /> Annual CO2 Offset</span>
                <h3 className="text-2xl font-black text-[#30D5FF]">{data.carbon_savings.toLocaleString()} kg</h3>
              </div>
            </div>

            {/* Cash flow projection chart */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">
                Projected cumulative cash flow payback curve
              </span>

              <div className="h-[220px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3FE6A8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3FE6A8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 58, 56, 0.1)" />
                    <XAxis dataKey="year" stroke="#6F8088" fontSize={10} tickLine={false} />
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
                      dataKey="cash"
                      name="Cumulative Cash Balance"
                      stroke="#3FE6A8"
                      fillOpacity={1}
                      fill="url(#colorCash)"
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
export default CircularROIPage;
