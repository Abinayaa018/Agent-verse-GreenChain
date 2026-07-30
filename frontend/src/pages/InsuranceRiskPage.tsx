import React, { useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Send, ShieldAlert, ShieldCheck, Sparkles, AlertTriangle, HelpCircle } from 'lucide-react';

interface RiskData {
  risk_score: number;
  insurance_recommendation: str;
  premium_estimate: number;
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigation_suggestions: string[];
  confidence: number;
}

export const InsuranceRiskPage: React.FC = () => {
  const [material, setMaterial] = useState('plastic');
  const [quantity, setQuantity] = useState('2500');
  const [distance, setDistance] = useState('150');
  const [vehicle, setVehicle] = useState('Flatbed Carrier');
  const [season, setSeason] = useState('summer');
  const [data, setData] = useState<RiskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/insurance-risk`, {
        material_type: material,
        quantity: parseFloat(quantity),
        distance: parseFloat(distance),
        vehicle_type: vehicle,
        season
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run logistics risk profiling:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const materials = ["plastic", "metal", "battery", "paper", "textile"];
  const vehicles = ["Heavy Duty Dump", "Electric Box Truck", "Flatbed Carrier", "Compact Logistics Van"];
  const seasons = ["summer", "winter", "monsoon", "spring"];

  const getBarColor = (score: number) => {
    if (score >= 8.0) return '#EF4444'; // red
    if (score >= 5.5) return '#F59E0B'; // amber
    if (score >= 3.0) return '#30D5FF'; // cyan
    return '#3FE6A8'; // green
  };

  // Mock comparison of risk components
  const chartData = data ? [
    { name: 'Fire Hazard', score: material === 'battery' ? 8.2 : 1.5 },
    { name: 'Delay Prob', score: season === 'monsoon' ? 7.5 : distance > 300 ? 5.5 : 2.5 },
    { name: 'Weather Threat', score: season === 'monsoon' ? 8.0 : 2.0 },
    { name: 'Overall Risk', score: data.risk_score }
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter entries */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#3FE6A8]" />
            TRANSIT RISK ASSESSMENT
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Forecast operational cargo leakage, fire safety, weather disruption risk, and insurance premium benchmarks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Material Class</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA] cursor-pointer"
            >
              {materials.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Qty (kg)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Distance (km)</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Vehicle Carrier type</label>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA] cursor-pointer"
            >
              {vehicles.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Season</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA] cursor-pointer"
            >
              {seasons.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Analyzing random forests..." : "Analyze Transit Risks"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome panels */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No risk audits generated yet. Propose shipping params to evaluate.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Risk profile cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[130px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Premium Estimate</span>
                <h3 className="text-3xl font-black text-[#3FE6A8]">₹{data.premium_estimate.toLocaleString()}</h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[130px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Assessed Threat</span>
                <span className={`text-xl font-black uppercase ${
                  data.risk_category === 'CRITICAL' || data.risk_category === 'HIGH' ? 'text-red-400' : data.risk_category === 'MEDIUM' ? 'text-amber-400' : 'text-[#3FE6A8]'
                }`}>{data.risk_category} RISK ({data.risk_score})</span>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[130px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Model Accuracy</span>
                <h3 className="text-3xl font-black text-[#30D5FF]">{(data.confidence * 100).toFixed(0)}%</h3>
              </div>
            </div>

            {/* Insurance recommendation panel */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-[#30D5FF]" /> Insurance Advisory Coverage</span>
              <p className="text-xs text-[#B9C4CC] leading-relaxed font-bold">{data.insurance_recommendation}</p>
            </div>

            {/* Suggestions list */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /> Operational Risk Mitigation Steps</span>
              <div className="flex flex-col gap-2.5 pl-3 relative border-l border-[#1B3A38]/30">
                {data.mitigation_suggestions.map((sug, idx) => (
                  <div key={idx} className="relative py-0.5">
                    <span className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#3FE6A8]" />
                    <p className="text-xs text-[#B9C4CC] font-medium">{sug}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Component bar chart */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> Hazard Component Risk Index
              </span>

              <div className="h-[200px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 58, 56, 0.1)" />
                    <XAxis dataKey="name" stroke="#6F8088" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#6F8088" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#061016',
                        borderColor: '#1B3A38',
                        borderRadius: '12px',
                        color: '#F5F7FA',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="score" name="Component threat">
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default InsuranceRiskPage;
