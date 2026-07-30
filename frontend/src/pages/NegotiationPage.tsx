import React, { useState } from 'react';
import axios from 'axios';
import { Send, Sparkles, MessageSquare, DollarSign, Award, ShieldAlert, BadgeCheck } from 'lucide-react';

interface TranscriptItem {
  round_num: number;
  sender: string;
  offer_price: number;
  message: string;
}

interface NegotiationData {
  transcript: TranscriptItem[];
  final_price: number;
  savings: number;
  acceptance_probability: number;
  negotiation_score: number;
}

export const NegotiationPage: React.FC = () => {
  const [buyer, setBuyer] = useState('Tiruppur Textiles');
  const [seller, setSeller] = useState('Coimbatore E-Hub');
  const [material, setMaterial] = useState('plastic');
  const [quantity, setQuantity] = useState('5000');
  const [targetPrice, setTargetPrice] = useState('22');
  const [urgency, setUrgency] = useState('medium');
  const [data, setData] = useState<NegotiationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/negotiate`, {
        buyer,
        seller,
        material,
        quantity: parseFloat(quantity),
        target_price: parseFloat(targetPrice),
        urgency
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run negotiations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const buyers = ["Tiruppur Textiles", "EcoFibre Ltd", "Electro-Recycle", "Kovai Paper Mills"];
  const sellers = ["Chennai Polymers", "Salem Steel", "Coimbatore E-Hub", "Salem Scrap Yard"];
  const materials = ["plastic", "metal", "battery", "paper", "textile"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameters Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#3FE6A8]" />
            COMMERCIAL NEGOTIATION
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Conduct automated commercial negotiations and price discovery rounds using Gemini reasoning.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Buyer name</label>
            <select
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {buyers.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Seller name</label>
            <select
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {sellers.map((s) => <option key={s} value={s}>{s}</option>)}
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
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA]"
              >
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Quantity (kg)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Target Price (₹)</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
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
            {isLoading ? "Running Negotiation Rounds..." : "Start Auto-Bargaining"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome transcript display */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              Bargaining cycles idle. Start auto-negotiations to discover rates.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* KPI Cards row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Final Agreed Price</span>
                <h3 className="text-2xl font-black text-[#F5F7FA]">₹{data.final_price}/kg</h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Calculated Savings</span>
                <h3 className="text-2xl font-black text-[#3FE6A8]">₹{data.savings.toLocaleString()}</h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Acceptance Prob</span>
                <h3 className="text-2xl font-black text-[#30D5FF]">{(data.acceptance_probability * 100).toFixed(0)}%</h3>
              </div>

              <div className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[110px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Deal Score</span>
                <h3 className="text-2xl font-black text-amber-400">{data.negotiation_score} <span className="text-[10px] text-[#6F8088]">/10</span></h3>
              </div>
            </div>

            {/* Conversation Log Bubble Container */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#3FE6A8]" /> Negotiation Dialogue Transcript</span>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                {data.transcript.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1 max-w-[85%] ${
                      item.sender === 'Buyer' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#6F8088] font-mono">
                      <span>{item.sender}</span>
                      <span className="w-1 h-1 rounded-full bg-[#1B3A38]" />
                      <span className="text-[#30D5FF]">₹{item.offer_price}/kg</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-[16px] text-xs leading-relaxed ${
                        item.sender === 'Buyer'
                          ? 'bg-[#1B3A38]/40 border border-[#3FE6A8]/20 text-[#F5F7FA] rounded-tr-none'
                          : 'bg-[#081318] border border-[#1B3A38]/30 text-[#B9C4CC] rounded-tl-none'
                      }`}
                    >
                      {item.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract generation alert advice */}
            <div className="p-5 rounded-[20px] bg-[#1B3A38]/20 border border-[#3FE6A8]/30 flex gap-3 items-center">
              <BadgeCheck className="w-6 h-6 text-[#3FE6A8] flex-shrink-0" />
              <p className="text-xs text-[#B9C4CC] leading-normal font-bold">
                Commercial agreement settled at <span className="text-[#F5F7FA]">₹{data.final_price}/kg</span>. Proceed to the Smart Contract module to compile legally structured PDFs and record verification signatures.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default NegotiationPage;
