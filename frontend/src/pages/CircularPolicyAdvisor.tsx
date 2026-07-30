import React, { useState } from 'react';
import axios from 'axios';
import { Send, FileText, Sparkles, AlertTriangle, ShieldCheck, Award, Clock } from 'lucide-react';

interface PolicyData {
  policy_summary: string;
  regulatory_risks: string[];
  recommended_changes: string[];
  government_incentives: string[];
  compliance_roadmap: string[];
}

export const CircularPolicyAdvisor: React.FC = () => {
  const [profile, setProfile] = useState('Medium scale garment recycling mill with 15 sorting conveyor stations');
  const [industry, setIndustry] = useState('Textiles');
  const [location, setLocation] = useState('Tiruppur, Tamil Nadu');
  const [data, setData] = useState<PolicyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/circular-policy`, {
        company_profile: profile,
        industry: industry,
        location: location
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run circular policy query:', err);
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
            <FileText className="w-5 h-5 text-[#3FE6A8]" />
            REGULATORY RISK
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Analyze state and national environmental regulations and write compliance updates using Gemini.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Company Profile Brief</label>
            <textarea
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              rows={3}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA] resize-none"
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
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Consulting Gemini..." : "Sourcing Regulations"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <FileText className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No active policy roadmaps loaded. Enter company parameters and run.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Policy Summary */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3 relative overflow-hidden">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> Gemini Regulatory Summary</span>
              <p className="text-xs text-[#B9C4CC] leading-relaxed italic font-medium">
                "{data.policy_summary}"
              </p>
            </div>

            {/* Risks & Changes grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-400" /> Compliance Risks</span>
                <div className="flex flex-col gap-2">
                  {data.regulatory_risks.map((risk, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <p className="font-semibold">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#3FE6A8]" /> Recommended Updates</span>
                <div className="flex flex-col gap-2">
                  {data.recommended_changes.map((ch, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8] mt-1.5 shrink-0" />
                      <p className="font-semibold">{ch}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Subsidies & roadmap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> Government Subsidies & Grants</span>
                <div className="flex flex-col gap-2">
                  {data.government_incentives.map((inc, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <p className="font-semibold">{inc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#30D5FF]" /> Compliance Milestones Roadmap</span>
                <div className="flex flex-col gap-2">
                  {data.compliance_roadmap.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#30D5FF] mt-1.5 shrink-0" />
                      <p className="font-semibold">{step}</p>
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
export default CircularPolicyAdvisor;
