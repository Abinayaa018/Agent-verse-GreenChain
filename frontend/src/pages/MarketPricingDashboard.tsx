import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, Sparkles, ShoppingCart, Activity } from 'lucide-react';

interface ForecastItem {
  month: string;
  price: number;
}

interface PriceRecommendation {
  material_type: str;
  recommended_price_inr_per_kg: number;
  price_trend: 'UPWARD' | 'STABLE' | 'DOWNWARD';
  demand_score: number;
  supply_score: number;
  future_prediction: ForecastItem[];
}

export const MarketPricingDashboard: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState('plastic');
  const [data, setData] = useState<PriceRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPricingData = async (mat: string) => {
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/pricing/recommendation`, {
        params: { material_type: mat }
      });
      setData(res.data);
    } catch (e) {
      console.error('Failed to load pricing:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPricingData(selectedMaterial);
  }, [selectedMaterial]);

  const materials = [
    { value: 'plastic', label: 'Industrial Polyethylene' },
    { value: 'metal', label: 'Non-Ferrous Scrap Metal' },
    { value: 'battery', label: 'Lithium Black Mass' },
    { value: 'textile', label: 'Post-Industrial Cotton' },
    { value: 'organic', label: 'Commercial Organic Waste' }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Selector & Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#3FE6A8]" />
            DYNAMIC PRICING & MARKET ANALYTICS
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Evaluate marketplace liquidity pools, supply/demand index coefficients, and future price predictions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Commodity Group:</label>
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="bg-[#09171C] border border-[#1B3A38]/40 rounded-[12px] py-2 px-4 text-xs font-bold text-[#F5F7FA] focus:outline-none focus:border-[#3FE6A8] cursor-pointer"
          >
            {materials.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/20 flex items-center justify-center text-xs text-[#6F8088] font-bold">
          Training pricing regression model in background...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recommended price and score gauges */}
          <div className="flex flex-col gap-6">
            
            {/* Price Card */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 shadow-[0_0_20px_rgba(63,230,168,0.02)] flex flex-col justify-between h-[200px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] rounded-full bg-[#3FE6A8]/5 blur-[30px] pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Recommended Value</span>
                <span className={`flex items-center gap-1 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${
                  data.price_trend === 'UPWARD' 
                    ? 'bg-emerald-950/40 text-[#3FE6A8]' 
                    : data.price_trend === 'DOWNWARD' 
                    ? 'bg-red-950/40 text-red-400' 
                    : 'bg-cyan-950/40 text-[#30D5FF]'
                }`}>
                  {data.price_trend === 'UPWARD' ? <TrendingUp className="w-3 h-3" /> : data.price_trend === 'DOWNWARD' ? <TrendingDown className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                  {data.price_trend} TREND
                </span>
              </div>
              
              <div>
                <h3 className="text-4xl font-black text-[#F5F7FA] tracking-tight">
                  ₹{data.recommended_price_inr_per_kg.toFixed(2)}
                  <span className="text-sm font-bold text-[#6F8088]"> / kg</span>
                </h3>
                <p className="text-[10px] text-[#B9C4CC] mt-1">Recommended pricing optimized for immediate transaction execution.</p>
              </div>
            </div>

            {/* Liquidity Indexes Gauges */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-5">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Liquidity Index Levels</span>
              
              {/* Demand Score */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-[#B9C4CC]">DEMAND COEFFICIENT</span>
                  <span className="text-[#30D5FF] font-mono">{data.demand_score} / 10.0</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#081318] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#30D5FF] to-[#2DD4FF] rounded-full shadow-[0_0_8px_#30D5FF]"
                    style={{ width: `${data.demand_score * 10}%` }}
                  />
                </div>
              </div>

              {/* Supply Score */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-[#B9C4CC]">SUPPLY INDEX</span>
                  <span className="text-[#3FE6A8] font-mono">{data.supply_score} / 10.0</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#081318] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3FE6A8] to-[#5CFFB5] rounded-full shadow-[0_0_8px_#3FE6A8]"
                    style={{ width: `${data.supply_score * 10}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Forecasting Recharts Graph */}
          <div className="lg:col-span-2 p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#30D5FF]" />
                Linear Regression Price Forecast (3-Month Outlook)
              </span>
              <span className="text-[9px] font-mono text-[#6F8088] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#3FE6A8]" />
                REGRESSION_MODEL_FIT: SCIKIT-LEARN
              </span>
            </div>

            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.future_prediction}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 58, 56, 0.15)" />
                  <XAxis
                    dataKey="month"
                    stroke="#6F8088"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6F8088"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
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
                    name="Forecast Rate (INR)"
                    stroke="#3FE6A8"
                    strokeWidth={2.5}
                    dot={{ fill: '#3FE6A8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#30D5FF', stroke: '#09171C' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
export default MarketPricingDashboard;
