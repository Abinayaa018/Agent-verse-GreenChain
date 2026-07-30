import React, { useState } from 'react';
import axios from 'axios';
import { Send, Leaf, Sparkles, AlertTriangle, Hammer, RefreshCw } from 'lucide-react';

interface DesignData {
  material_substitutions: string[];
  repairability_guidelines: string[];
  recyclability_rating: number;
  design_improvements: string[];
  reuse_opportunities: string[];
  executive_summary: string;
}

export const CircularDesign: React.FC = () => {
  const [productType, setProductType] = useState('Packaging Box');
  const [material, setMaterial] = useState('Polystyrene co-extrusion with aluminum backing film');
  const [industry, setIndustry] = useState('Food Packaging');
  const [data, setData] = useState<DesignData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/circular-design`, {
        product_type: productType,
        material_composition: material,
        industry: industry
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run circular design recommendation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameters Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#3FE6A8]" />
            CIRCULAR DESIGN
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Suggest product redesign strategies using Gemini to maximize end-of-life recovery cycles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Product Name/Type</label>
            <input
              type="text"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Material Composition</label>
            <textarea
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              rows={3}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA] resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Industry Segment</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Consulting Gemini..." : "Audit Circularity"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <Leaf className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No active circularity designs loaded. Submit specs to audit.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Recyclability Score dial */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[130px]">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-[#3FE6A8]/5 blur-[30px] pointer-events-none" />
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Recyclability Index Rating</span>
              <div>
                <h3 className="text-3xl font-black text-[#3FE6A8]">{data.recyclability_rating}%</h3>
                <div className="w-full bg-[#081318] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#3FE6A8] h-full" style={{ width: `${data.recyclability_rating}%` }} />
                </div>
              </div>
            </div>

            {/* AI Advisor summary */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3 relative overflow-hidden">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> Gemini Design Summary</span>
              <p className="text-xs text-[#B9C4CC] leading-relaxed italic font-medium">
                "{data.executive_summary}"
              </p>
            </div>

            {/* Substitutions & Repair grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><RefreshCw className="w-4 h-4 text-[#3FE6A8]" /> Material Substitutions</span>
                <div className="flex flex-col gap-2">
                  {data.material_substitutions.map((sub, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8] mt-1.5 shrink-0" />
                      <p className="font-semibold">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Hammer className="w-4 h-4 text-[#30D5FF]" /> Repairability Guidelines</span>
                <div className="flex flex-col gap-2">
                  {data.repairability_guidelines.map((rep, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#30D5FF] mt-1.5 shrink-0" />
                      <p className="font-semibold">{rep}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Redesign recommendations checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /> Structural Redesigns</span>
                <div className="flex flex-col gap-2">
                  {data.design_improvements.map((imp, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <p className="font-semibold">{imp}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Leaf className="w-4 h-4 text-[#3FE6A8]" /> Reuse opportunities</span>
                <div className="flex flex-col gap-2">
                  {data.reuse_opportunities.map((opp, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8] mt-1.5 shrink-0" />
                      <p className="font-semibold">{opp}</p>
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
export default CircularDesign;
