import React, { useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Binary, ShieldAlert, Sparkles, Send } from 'lucide-react';

interface WastePredictionData {
  predicted_waste: number;
  waste_categories: { [key: string]: number };
  next_month_prediction: number;
  confidence: number;
}

export const WastePrediction: React.FC = () => {
  const [company, setCompany] = useState('Tiruppur Textiles');
  const [industry, setIndustry] = useState('textiles');
  const [volume, setVolume] = useState('500');
  const [data, setData] = useState<WastePredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/predict-waste`, {
        company,
        industry,
        production_volume: parseFloat(volume)
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to predict waste:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const industries = ['textiles', 'packaging', 'electronics', 'agriculture', 'construction', 'manufacturing'];
  const companies = ['Tiruppur Textiles', 'EcoFibre Ltd', 'Electro-Recycle', 'Kovai Paper Mills', 'Chennai Polymers', 'Salem Steel'];

  // Prepare chart data for waste category breakdown
  const chartData = data 
    ? Object.keys(data.waste_categories).map((cat) => ({
        name: cat.toUpperCase(),
        volume: data.waste_categories[cat]
      }))
    : [];

  const COLORS = ['#3FE6A8', '#30D5FF', '#5CFFB5', '#A5F3FC'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Submission Form */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Binary className="w-5 h-5 text-[#3FE6A8]" />
            WASTE PREDICTION
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Predict upcoming waste volumes using Random Forest Regressor models trained on corporate histories.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Company Entity</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Sector Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Production Volume (units)</label>
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3 px-5 rounded-[12px]"
          >
            {isLoading ? "Running RF Regression..." : "Forecast Waste Output"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Results View */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No active predictions. Submit company parameters to estimate waste volumes.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[130px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Predicted Output</span>
                <h3 className="text-3xl font-black text-[#F5F7FA] tracking-tight">
                  {data.predicted_waste.toLocaleString()} <span className="text-sm font-bold text-[#6F8088]">kg</span>
                </h3>
              </div>

              <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[130px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Subsequent Month</span>
                <h3 className="text-3xl font-black text-[#30D5FF] tracking-tight">
                  {data.next_month_prediction.toLocaleString()} <span className="text-sm font-bold text-[#6F8088]">kg</span>
                </h3>
              </div>

              <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[130px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Model Accuracy R²</span>
                <div className="space-y-1.5">
                  <span className="text-xl font-bold text-[#3FE6A8] font-mono">{(data.confidence * 100).toFixed(1)}%</span>
                  <div className="w-full h-1.5 rounded-full bg-[#081318] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#3FE6A8] to-[#5CFFB5] rounded-full"
                      style={{ width: `${data.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recharts Distribution Graph */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" />
                Estimated Categorical Material Composition Breakdown
              </span>

              <div className="h-[220px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 58, 56, 0.1)" />
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
                    <Bar dataKey="volume" name="Volume (kg)">
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
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
export default WastePrediction;
