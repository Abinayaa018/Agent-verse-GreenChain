import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Compass, Sparkles, Building2, Link2, DollarSign, ShieldAlert } from 'lucide-react';

interface NodeItem {
  id: string;
  role: string;
  details: string;
}

interface LinkItem {
  source: string;
  target: string;
  relation: string;
}

interface OpportunityItem {
  title: string;
  savings: number;
  details: string;
}

interface CollabData {
  nodes: NodeItem[];
  links: LinkItem[];
  opportunities: OpportunityItem[];
  expected_savings: number;
}

export const IndustrialCollaborationPage: React.FC = () => {
  const [data, setData] = useState<CollabData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/industrial-collaboration`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load industrial synergies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Intro Header */}
      <div className="p-5 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#3FE6A8]" />
            INDUSTRIAL COLLABORATION
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Discover regional factory clusters to suggest waste resource sharing, co-location projects, and logistics consolidations.
          </p>
        </div>
        {data && (
          <div className="bg-[#09171C] border border-[#1B3A38] rounded-[12px] px-4 py-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#3FE6A8]" />
            <span className="text-xs font-black text-[#3FE6A8]">Est. Savings: ₹{data.expected_savings.toLocaleString()}</span>
          </div>
        )}
      </div>

      {isLoading || !data ? (
        <div className="p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center text-xs font-bold text-[#6F8088]">
          Aggregating regional factory machinery inventories and material outputs...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Nodes list */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Cluster Factory Nodes</span>
            {data.nodes.map((node) => (
              <div key={node.id} className="p-4 rounded-[18px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2 relative overflow-hidden">
                <span className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase rounded-bl-[12px] ${
                  node.role === 'Supplier' ? 'bg-[#30D5FF]/10 text-[#30D5FF]' : node.role === 'Processor' ? 'bg-purple-500/10 text-purple-400' : 'bg-[#3FE6A8]/10 text-[#3FE6A8]'
                }`}>{node.role}</span>
                <h4 className="text-xs font-black text-[#F5F7FA] mt-1 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-[#6F8088]" />{node.id}</h4>
                <p className="text-[11px] text-[#B9C4CC] leading-relaxed mt-1 font-medium">{node.details}</p>
              </div>
            ))}
          </div>

          {/* Synergy layout connections */}
          <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Link2 className="w-4 h-4 text-[#30D5FF]" /> Active Synergy Links</span>
            
            <div className="flex flex-col gap-4 mt-2">
              {data.links.map((link, idx) => (
                <div key={idx} className="p-4 rounded-[14px] bg-[#081318]/50 border border-[#1B3A38]/20 flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-[#6F8088]">
                    <span>FROM: {link.source}</span>
                    <span>TO: {link.target}</span>
                  </div>
                  <p className="text-xs text-[#3FE6A8] font-black">{link.relation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Joint Venture Opportunities */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-400" /> Synergy Investment Projects</span>
            {data.opportunities.map((opp, idx) => (
              <div key={idx} className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2.5">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-black text-[#F5F7FA] leading-normal">{opp.title}</h4>
                  <span className="text-[10px] font-mono text-[#3FE6A8] font-bold shrink-0">₹{opp.savings.toLocaleString()} savings</span>
                </div>
                <p className="text-[11px] text-[#B9C4CC] leading-relaxed font-medium">{opp.details}</p>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};
export default IndustrialCollaborationPage;
