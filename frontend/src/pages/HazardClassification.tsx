import React, { useState } from 'react';
import axios from 'axios';
import { Send, AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, Truck, Trash2, Home } from 'lucide-react';

interface HazardData {
  hazard_category: string;
  handling_procedures: string[];
  ppe: string[];
  storage: string;
  transport: string;
  disposal: string;
}

export const HazardClassification: React.FC = () => {
  const [material, setMaterial] = useState('Spent Lead-Acid Battery Casing');
  const [composition, setComposition] = useState('Lead dioxide 65%, Sulfuric acid 28%, Polypropylene 7%');
  const [description, setDescription] = useState('Crushed casing segments recovered from automotive battery recycler');
  const [msds, setMsds] = useState('UN 2794, Class 8 Corrosive, Hazard Code H314 causes severe burns');
  const [data, setData] = useState<HazardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/hazard-classification`, {
        material: material,
        chemical_composition: composition,
        waste_description: description,
        msds_text: msds
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run hazard classification:', err);
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
            <AlertTriangle className="w-5 h-5 text-[#3FE6A8]" />
            HAZARD AUDIT
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Classify raw materials or scrap runs based on chemical composition and MSDS guidelines.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Material/Chemical Name</label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Chemical Composition</label>
            <input
              type="text"
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Waste Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA] resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">MSDS Codes / References</label>
            <input
              type="text"
              value={msds}
              onChange={(e) => setMsds(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Consulting Gemini..." : "Classify Chemical Hazard"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No hazard audits evaluated. Submit chemical references to verify.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Status card */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex justify-between items-center h-[120px]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Hazard Class</span>
                <h3 className={`text-2xl font-black mt-1 uppercase ${
                  data.hazard_category === 'HAZARDOUS' || data.hazard_category === 'TOXIC' ? 'text-red-400 animate-pulse' : 'text-[#3FE6A8]'
                }`}>{data.hazard_category}</h3>
              </div>
              <ShieldAlert className={`w-8 h-8 ${
                data.hazard_category === 'HAZARDOUS' || data.hazard_category === 'TOXIC' ? 'text-red-400' : 'text-[#3FE6A8]'
              }`} />
            </div>

            {/* Procedures and PPE row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-red-400" /> Safe Handling Guidelines</span>
                <div className="flex flex-col gap-2">
                  {data.handling_procedures.map((proc, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <p>{proc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#3FE6A8]" /> Required PPE Gear</span>
                <div className="flex flex-wrap gap-2">
                  {data.ppe.map((gear, idx) => (
                    <span key={idx} className="bg-[#1B3A38]/40 border border-[#3FE6A8]/20 px-3 py-1.5 rounded-[12px] text-xs font-bold text-[#3FE6A8]">{gear}</span>
                  ))}
                </div>
              </div>

            </div>

            {/* Storage, Transport, Neutralization cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2 min-h-[140px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Home className="w-3.5 h-3.5 text-[#30D5FF]" /> Storage Vault</span>
                <p className="text-[11px] text-[#B9C4CC] leading-relaxed font-semibold">{data.storage}</p>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2 min-h-[140px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-[#3FE6A8]" /> Logistics Carrier</span>
                <p className="text-[11px] text-[#B9C4CC] leading-relaxed font-semibold">{data.transport}</p>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2 min-h-[140px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Trash2 className="w-3.5 h-3.5 text-purple-400" /> Neutralization</span>
                <p className="text-[11px] text-[#B9C4CC] leading-relaxed font-semibold">{data.disposal}</p>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default HazardClassification;
