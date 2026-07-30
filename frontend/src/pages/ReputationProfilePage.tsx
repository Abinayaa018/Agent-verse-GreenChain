import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Compass, Sparkles, Building2, Globe, ShieldCheck } from 'lucide-react';

interface ReputationData {
  reputation_index: number;
  industry_rank: number;
  badges: string[];
  public_profile_summary: string;
  improvement_suggestions: string[];
}

interface ReputationProfileProps {
  company: string;
}

export const ReputationProfilePage: React.FC<ReputationProfileProps> = ({ company }) => {
  const [data, setData] = useState<ReputationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async (compName: string) => {
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/sustainability-reputation`, {
        params: { company_name: compName }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load reputation profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(company);
  }, [company]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Info Panel */}
      <div className="p-5 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Award className="w-5 h-5 text-[#3FE6A8]" />
            SUSTAINABILITY REPUTATION INDEX
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Aggregate circular credits offsets, compliance records, and marketplace transaction logs to compile public reputation standings.
          </p>
        </div>
        <div className="bg-[#09171C] border border-[#1B3A38] rounded-[12px] px-4 py-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#3FE6A8]" />
          <span className="text-xs font-black text-[#F5F7FA]">{company.toUpperCase()}</span>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center text-xs font-bold text-[#6F8088]">
          Aggregating company compliance grades and ledger weights...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Reputation score dial */}
          <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[180px]">
            <div className="absolute top-0 right-0 w-[140px] h-[140px] rounded-full bg-[#3FE6A8]/5 blur-[35px] pointer-events-none" />
            <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Reputation index</span>
            <div>
              <h3 className="text-5xl font-black text-[#3FE6A8] tracking-tight">{data.reputation_index} <span className="text-xs font-bold text-[#6F8088]">/100</span></h3>
              <p className="text-xs text-[#B9C4CC] font-bold mt-2">Circularity Sector Standing Rank: #{data.industry_rank}</p>
            </div>
          </div>

          {/* Public Profile Summary */}
          <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3 relative overflow-hidden lg:col-span-2">
            <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> AI Brand Profile Analysis</span>
            <p className="text-xs text-[#B9C4CC] leading-relaxed italic font-medium">
              "{data.public_profile_summary}"
            </p>
          </div>

          {/* Badges checklist */}
          <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> Active Certifications & Badges</span>
            <div className="flex flex-wrap gap-2">
              {data.badges.map((b, idx) => (
                <span
                  key={idx}
                  className="bg-[#1B3A38]/40 border border-[#3FE6A8]/20 px-3.5 py-2 rounded-[12px] text-xs font-bold text-[#3FE6A8]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions checklist */}
          <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4 lg:col-span-2">
            <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#30D5FF]" /> Reputation Score Improvement Guidelines</span>
            <div className="flex flex-col gap-3">
              {data.improvement_suggestions.map((sug, idx) => (
                <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8] mt-1.5 flex-shrink-0" />
                  <p className="font-medium">{sug}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
export default ReputationProfilePage;
