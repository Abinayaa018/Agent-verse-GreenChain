import React, { useState } from 'react';
import axios from 'axios';
import { Send, ShoppingBag, Sparkles, DollarSign, Leaf, RefreshCw } from 'lucide-react';

interface ProcurementData {
  recommended_suppliers: string[];
  alternative_materials: string[];
  cost_reduction_suggestions: string[];
  sustainability_improvements: string[];
  advisory_brief: string;
}

export const CircularProcurement: React.FC = () => {
  const [material, setMaterial] = useState('Nylon textile scraps');
  const [industry, setIndustry] = useState('Textiles');
  const [budget, setBudget] = useState('35');
  const [quality, setQuality] = useState('Grade B');
  const [data, setData] = useState<ProcurementData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/circular-procurement`, {
        required_material: material,
        industry: industry,
        budget: parseFloat(budget),
        quality: quality
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run circular procurement recommendation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const qualities = ["Grade A", "Grade B", "Grade C"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameters Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#3FE6A8]" />
            CIRCULAR PROCUREMENT
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Recommend local recycled material suppliers and alternative materials using Gemini models.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Required Material</label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Quality Grade</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              >
                {qualities.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Procurement Budget Cap (₹/kg)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Consulting Gemini..." : "Sourcing Green Suppliers"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No active green sourcing audits loaded. Submit procurement needs to query.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* AI Advisor brief */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3 relative overflow-hidden">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> Gemini Sourcing Advisory Brief</span>
              <p className="text-xs text-[#B9C4CC] leading-relaxed italic font-medium">
                "{data.advisory_brief}"
              </p>
            </div>

            {/* Recommended Suppliers */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-[#3FE6A8]" /> Recommended Sourcing Partners</span>
              <div className="flex flex-col gap-2.5">
                {data.recommended_suppliers.map((sup, idx) => (
                  <div key={idx} className="p-3.5 rounded-[12px] bg-[#081318]/40 border border-[#1B3A38]/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-[#F5F7FA]">{sup}</span>
                    <span className="text-[10px] font-mono text-[#3FE6A8] uppercase tracking-wider font-bold">Verified green seller</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternative circular materials */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><RefreshCw className="w-4 h-4 text-[#30D5FF]" /> Alternative Circular Materials</span>
              <div className="flex flex-col gap-2">
                {data.alternative_materials.map((alt, idx) => (
                  <div key={idx} className="flex gap-2 items-center text-xs text-[#B9C4CC] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30D5FF]" />
                    <span>{alt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost reduction & Sustainability Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-amber-400" /> Cost Reduction Suggestions</span>
                <div className="flex flex-col gap-2">
                  {data.cost_reduction_suggestions.map((sug, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <p className="font-semibold">{sug}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Leaf className="w-4 h-4 text-[#3FE6A8]" /> Footprint Mitigation</span>
                <div className="flex flex-col gap-2">
                  {data.sustainability_improvements.map((imp, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8] mt-1.5 shrink-0" />
                      <p className="font-semibold">{imp}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default CircularProcurement;
