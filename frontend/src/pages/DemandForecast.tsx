import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';

interface ForecastData {
  demand_score: number;
  predicted_price: number;
  next_month_demand: number;
  trend: 'UPWARD' | 'DOWNWARD' | 'STABLE';
  confidence: number;
  inventory_recommendation: string;
}

export const DemandForecast: React.FC = () => {
  const [material, setMaterial] = useState('plastic');
  const [industry, setIndustry] = useState('packaging');
  const [data, setData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate chart data based on demand_score
  const getChartData = (score: number, price: number) => {
    const base = price;
    return [
      { name: 'Week 1', price: Math.round(base * 0.95 * 10) / 10, index: Math.max(1, score - 0.5) },
      { name: 'Week 2', price: Math.round(base * 0.98 * 10) / 10, index: Math.max(1, score - 0.2) },
      { name: 'Week 3', price: Math.round(base * 10) / 10, index: score },
      { name: 'Week 4 (Forecast)', price: Math.round(base * (1 + (score - 5) * 0.02) * 10) / 10, index: score }
    ];
  };

  const loadData = async (mat: string, ind: string) => {
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/demand-forecast`, {
        params: { material: mat, industry: ind }
      });
      setData(res.data);
    } catch (e) {
      console.error('Failed to load demand forecast:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(material, industry);
  }, [material, industry]);

  const materials = ['plastic', 'metal', 'battery', 'paper', 'glass', 'textile', 'organic'];
  const industries = ['automotive', 'packaging', 'electronics', 'textiles', 'agriculture', 'construction'];

  const chartData = data ? getChartData(data.demand_score, data.predicted_price) : [];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#3FE6A8]" />
            INTELLIGENT DEMAND FORECASTING
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Predict future commodity values and demand trajectories using Prophet and XGBoost ensembles.
          </p>
        </div>
        
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#09171C] border border-[#1B3A38]/40 rounded-[12px] px-3 py-1.5">
            <span className="text-[10px] font-mono text-[#6F8088] uppercase">Material:</span>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#F5F7FA] outline-none cursor-pointer"
            >
              {materials.map((m) => (
                <option key={m} value={m}>{m.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#09171C] border border-[#1B3A38]/40 rounded-[12px] px-3 py-1.5">
            <span className="text-[10px] font-mono text-[#6F8088] uppercase">Industry:</span>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#F5F7FA] outline-none cursor-pointer"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/20 flex items-center justify-center text-xs text-[#6F8088] font-bold">
          Training models & loading forecasts...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="flex flex-col gap-6">
            {/* Demand Score Card */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[160px]">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-[#3FE6A8]/5 blur-[25px] pointer-events-none" />
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Demand Index</span>
                <span className={`flex items-center gap-1 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${
                  data.trend === 'UPWARD' 
                    ? 'bg-emerald-950/40 text-[#3FE6A8]' 
                    : data.trend === 'DOWNWARD' 
                    ? 'bg-red-950/40 text-red-400' 
                    : 'bg-cyan-950/40 text-[#30D5FF]'
                }`}>
                  {data.trend === 'UPWARD' ? <TrendingUp className="w-3 h-3" /> : data.trend === 'DOWNWARD' ? <TrendingDown className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                  {data.trend}
                </span>
              </div>
              <div>
                <h3 className="text-4xl font-black text-[#F5F7FA] tracking-tight">{data.demand_score} <span className="text-sm font-bold text-[#6F8088]">/ 10</span></h3>
                <p className="text-[10px] text-[#B9C4CC] mt-1">Calculated market absorption coefficient.</p>
              </div>
            </div>

            {/* Price Prediction Card */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[160px]">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-[#30D5FF]/5 blur-[25px] pointer-events-none" />
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Predicted Price</span>
              <div>
                <h3 className="text-4xl font-black text-[#3FE6A8] tracking-tight">₹{data.predicted_price.toFixed(2)}<span className="text-sm font-bold text-[#6F8088]"> / kg</span></h3>
                <p className="text-[10px] text-[#B9C4CC] mt-1">Average transaction rate forecasted next month.</p>
              </div>
            </div>

            {/* Confidence Card */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Model Confidence Meter</span>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-[#B9C4CC]">VALIDATION METRIC</span>
                  <span className="text-[#3FE6A8] font-mono">{(data.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#081318] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3FE6A8] to-[#5CFFB5] rounded-full"
                    style={{ width: `${data.confidence * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-[9px] font-mono text-[#6F8088] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#30D5FF]" /> Champion Model: Prophet vs XGBoost validation complete.
              </span>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="lg:col-span-2 p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> Future price trajectory projection
            </span>

            <div className="h-[240px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 58, 56, 0.15)" />
                  <XAxis dataKey="name" stroke="#6F8088" fontSize={10} tickLine={false} />
                  <YAxis stroke="#6F8088" fontSize={10} tickLine={false} axisLine={false} />
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
                    dataKey="price"
                    name="Unit Rate (INR)"
                    stroke="#3FE6A8"
                    strokeWidth={2}
                    dot={{ fill: '#3FE6A8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Inventory advisory card */}
            <div className="p-4 rounded-[14px] bg-[#081318]/50 border border-[#1B3A38]/20 mt-2">
              <h4 className="text-[10px] font-black text-[#F5F7FA] uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-[#3FE6A8]" />
                Inventory Advisory Recommendation
              </h4>
              <p className="text-xs text-[#B9C4CC] leading-relaxed">{data.inventory_recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DemandForecast;
