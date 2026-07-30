import React, { useState } from 'react';
import axios from 'axios';
import { Send, Building2, Sparkles, DollarSign, Award, Leaf, ChevronRight, AlertCircle } from 'lucide-react';

interface InvestmentData {
  recommended_equipment: string;
  investment_cost: number;
  projected_roi: number;
  co2_savings_kg: number;
  efficiency_gain: number;
  priority_score: number;
  advisory_brief: string;
}

export const CircularInvestmentPage: React.FC = () => {
  const [company, setCompany] = useState('Tiruppur Textiles');
  const [budget, setBudget] = useState('500000');
  const [material, setMaterial] = useState('plastic');
  const [data, setData] = useState<InvestmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/circular-investment`, {
        company_name: company,
        budget_inr: parseFloat(budget),
        primary_material: material
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to analyze investment recommendation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const materials = ["plastic", "metal", "battery", "paper", "textile"];
  const companies = ["Tiruppur Textiles", "EcoFibre Ltd", "Electro-Recycle", "Kovai Paper Mills"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Inputs */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#3FE6A8]" />
            CAPITAL ADVISORY
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Optimize machinery investments (AI sorters, balers, solar) using Random Forest priority scores and Gemini reasoning.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Company name</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {companies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Material</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA]"
              >
                {materials.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Capex Budget (₹)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs text-[#F5F7FA]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Consulting Capital model..." : "Forecast Investment priorities"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <Building2 className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No active priorities recommendations. Enter a target budget to check capital allocations.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Primary recommendation cards */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between min-h-[130px]">
              <div className="absolute top-0 right-0 w-[130px] h-[130px] rounded-full bg-[#3FE6A8]/5 blur-[30px] pointer-events-none" />
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Award className="w-4 h-4 text-[#3FE6A8]" /> Recommended Capital Asset</span>
              <div>
                <h3 className="text-2xl font-black text-[#F5F7FA] mt-1">{data.recommended_equipment}</h3>
                <p className="text-xs text-[#3FE6A8] mt-1.5 font-bold">Acquisition cost: ₹{data.investment_cost.toLocaleString()} (Priority rank score: {data.priority_score}/10)</p>
              </div>
            </div>

            {/* AI Advisor advisory brief summary */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3 relative overflow-hidden">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> Gemini Investment Advisory Brief</span>
              <p className="text-xs text-[#B9C4CC] leading-relaxed italic font-medium">
                "{data.advisory_brief}"
              </p>
            </div>

            {/* Performance KPIs metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><DollarSign className="w-4 h-4 text-[#3FE6A8]" /> Estimated ROI</span>
                <h3 className="text-2xl font-black text-[#3FE6A8]">{data.projected_roi}%</h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Leaf className="w-4 h-4 text-[#30D5FF]" /> Annual CO2 savings</span>
                <h3 className="text-2xl font-black text-[#30D5FF]">{data.co2_savings_kg.toLocaleString()} kg</h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><AlertCircle className="w-4 h-4 text-purple-400" /> Output Efficiency Gain</span>
                <h3 className="text-2xl font-black text-purple-400">+{data.efficiency_gain}%</h3>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default CircularInvestmentPage;
