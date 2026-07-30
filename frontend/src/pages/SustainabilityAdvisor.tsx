import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck, DollarSign, Leaf, Send, AlertCircle } from 'lucide-react';

interface RecommendationResponse {
  recommendations: string[];
  priority_actions: string[];
  estimated_cost_savings: number;
  estimated_co2_reduction: number;
  roadmap: string[];
  executive_summary: string;
}

interface SustainabilityAdvisorProps {
  company: string;
}

export const SustainabilityAdvisor: React.FC<SustainabilityAdvisorProps> = ({ company }) => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAdvisor = async () => {
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/sustainability-advisor`, {
        company_name: company
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to query sustainability advisor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto">
      {/* Intro Header */}
      <div className="p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#3FE6A8]" />
            SUSTAINABILITY ADVISOR
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Query Google Gemini 2.5 Flash to reason over multi-agent logs and retrieve personalized carbon saving roadmap actions.
          </p>
        </div>
        <button
          onClick={handleAskAdvisor}
          disabled={isLoading}
          className="flex items-center gap-2 btn-primary-glow font-bold text-xs py-3 px-6 rounded-[12px] whitespace-nowrap self-stretch md:self-auto justify-center"
        >
          {isLoading ? "Consulting Gemini AI..." : "Consult AI Sustainability Advisor"}
          <Send className="w-4 h-4" />
        </button>
      </div>

      {!data ? (
        <div className="p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-4">
          <MessageSquare className="w-12 h-12 text-[#30D5FF] mx-auto animate-pulse" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-black text-[#F5F7FA] uppercase tracking-wide">AI Recommendation Advisor</h3>
            <p className="text-xs text-[#6F8088] leading-relaxed">
              Consolidate compliance ratings, marketplace records, logistics maps, and ESG savings to formulate carbon-reduction blueprints.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Stats and Priorities */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            {/* Cost Savings */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[130px]">
              <div className="absolute top-0 right-0 w-[110px] h-[110px] rounded-full bg-[#3FE6A8]/5 blur-[25px] pointer-events-none" />
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><DollarSign className="w-4 h-4 text-[#3FE6A8]" /> Estimated Cost Savings</span>
              <h3 className="text-3xl font-black text-[#3FE6A8] tracking-tight">₹{data.estimated_cost_savings.toLocaleString()}</h3>
            </div>

            {/* CO2 Savings */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[130px]">
              <div className="absolute top-0 right-0 w-[110px] h-[110px] rounded-full bg-[#30D5FF]/5 blur-[25px] pointer-events-none" />
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Leaf className="w-4 h-4 text-[#30D5FF]" /> Potential Carbon Cut</span>
              <h3 className="text-3xl font-black text-[#30D5FF] tracking-tight">{data.estimated_co2_reduction.toLocaleString()} <span className="text-sm font-bold text-[#6F8088]">kg CO₂</span></h3>
            </div>

            {/* Priority Actions */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-amber-400" /> Immediate Priorities</span>
              <div className="flex flex-col gap-3">
                {data.priority_actions.map((act, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC] leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8] mt-1.5 flex-shrink-0" />
                    <p className="font-bold text-[#F5F7FA]">{act}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Chat advisory & recommendations */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* AI Advisor Chat-style executive summary */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-[#1B3A38]/20 pb-3">
                <div className="w-9 h-9 rounded-full bg-[#3FE6A8]/10 border border-[#3FE6A8]/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#3FE6A8]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F5F7FA]">GEMINI SUSTAINABILITY INSIGHTS</h3>
                  <span className="text-[9px] font-mono text-[#6F8088] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#30D5FF]" /> Verification: reasoning over audit ledgers complete.
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#B9C4CC] leading-relaxed italic">
                "{data.executive_summary}"
              </p>
            </div>

            {/* Recommendations */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Detailed AI Recommendations</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-[14px] bg-[#081318]/40 border border-[#1B3A38]/20 flex flex-col justify-between">
                    <p className="text-xs text-[#B9C4CC] leading-relaxed mb-3">{rec}</p>
                    <span className="text-[9px] font-mono text-[#3FE6A8] uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline">
                      Investigate opportunity <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap progress points */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Sustainability Roadmap</span>
              <div className="flex flex-col gap-4 pl-4 relative border-l border-[#1B3A38]/30">
                {data.roadmap.map((step, idx) => (
                  <div key={idx} className="relative py-0.5">
                    <span className="absolute left-[-20px] top-1.5 w-2 h-2 rounded-full bg-[#30D5FF] shadow-[0_0_6px_#30D5FF]" />
                    <p className="text-xs text-[#B9C4CC] leading-normal font-bold">{step}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
export default SustainabilityAdvisor;
