import React, { useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Binary, ShieldAlert, Sparkles, Send, Award, Thermometer } from 'lucide-react';

interface QualityData {
  quality_score: number;
  predicted_moisture: number;
  predicted_contamination: number;
  degradation_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  resale_grade: string;
  confidence: number;
}

export const MaterialQuality: React.FC = () => {
  const [materialType, setMaterialType] = useState('plastic');
  const [industry, setIndustry] = useState('packaging');
  const [storageDays, setStorageDays] = useState('15');
  const [humidity, setHumidity] = useState('60');
  const [distance, setDistance] = useState('120');
  const [data, setData] = useState<QualityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/material-quality`, {
        material_type: materialType,
        industry,
        storage_days: parseInt(storageDays),
        humidity: parseFloat(humidity),
        transport_distance: parseFloat(distance)
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to get material quality prediction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const materials = ['plastic', 'metal', 'battery', 'paper', 'glass', 'textile', 'organic'];
  const industries = ['automotive', 'packaging', 'electronics', 'textiles', 'agriculture', 'construction'];

  // Prepare a simulated historical degradation trend based on storage days
  const getTrendData = (score: number) => {
    const days = parseInt(storageDays) || 10;
    return [
      { day: 'Day 0', quality: 9.5 },
      { day: `Day ${Math.round(days / 3)}`, quality: Math.round((9.5 - (9.5 - score) * 0.3) * 10) / 10 },
      { day: `Day ${Math.round(days * 2 / 3)}`, quality: Math.round((9.5 - (9.5 - score) * 0.7) * 10) / 10 },
      { day: `Day ${days} (Current)`, quality: score }
    ];
  };

  const trendData = data ? getTrendData(data.quality_score) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-[#3FE6A8]" />
            MATERIAL QUALITY
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Predict physical commodity quality degradation using historical storage log regression.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Material type</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {materials.map((m) => (
                <option key={m} value={m}>{m.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Industry origin</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Storage (days)</label>
              <input
                type="number"
                value={storageDays}
                onChange={(e) => setStorageDays(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Humidity (%)</label>
              <input
                type="number"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs text-[#F5F7FA]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Transport Distance (km)</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Running XGB/RF Regression..." : "Forecast Quality Score"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No active predictions. Run parameters to check physical degradation estimates.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Stats list */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Quality Score</span>
                <h3 className="text-2xl font-black text-[#F5F7FA]">{data.quality_score} <span className="text-xs font-bold text-[#6F8088]">/10</span></h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Predicted Moisture</span>
                <h3 className="text-2xl font-black text-[#30D5FF]">{data.predicted_moisture}%</h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Contamination</span>
                <h3 className="text-2xl font-black text-red-400">{data.predicted_contamination}%</h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Resale Grade</span>
                <span className="flex items-center gap-1.5 text-xs font-black text-[#3FE6A8]"><Award className="w-4 h-4 text-[#3FE6A8]" />{data.resale_grade}</span>
              </div>
            </div>

            {/* Risk and Confidence panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Degradation Risk</span>
                <span className={`text-sm font-black tracking-wider uppercase ${
                  data.degradation_risk === 'HIGH' ? 'text-red-400' : data.degradation_risk === 'MEDIUM' ? 'text-amber-400' : 'text-[#3FE6A8]'
                }`}>{data.degradation_risk} RISK</span>
              </div>

              <div className="md:col-span-2 p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Model Confidence Index</span>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-[#B9C4CC]">MODEL VALIDATION R²</span>
                    <span className="text-[#3FE6A8] font-mono">{(data.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#081318] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#3FE6A8] to-[#5CFFB5] rounded-full"
                      style={{ width: `${data.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Historical trend graph */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> Estimated storage degradation trajectory
              </span>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 58, 56, 0.1)" />
                    <XAxis dataKey="day" stroke="#6F8088" fontSize={10} tickLine={false} />
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
                    <Line
                      type="monotone"
                      dataKey="quality"
                      name="Quality Score"
                      stroke="#3FE6A8"
                      strokeWidth={2.5}
                      dot={{ fill: '#3FE6A8' }}
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
export default MaterialQuality;
