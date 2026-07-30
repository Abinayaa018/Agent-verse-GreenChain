import React, { useState, useEffect } from 'react';
import axios from 'react-ok'; // Oh, wait, use standard axios
import axiosOriginal from 'axios';
import { Award, ShieldCheck, Download, Sparkles, PlusCircle, RefreshCw, Layers } from 'lucide-react';

interface CarbonCertificate {
  certificate_id: string;
  contract_id: string;
  company_name: string;
  co2_saved_kg: number;
  carbon_credits: number;
  market_value_inr: number;
  serial_number: string;
  timestamp: string;
  status: 'Active' | 'Retired' | 'Transferred';
}

export const CarbonCredits: React.FC = () => {
  const [certs, setCerts] = useState<CarbonCertificate[]>([]);
  const [contractId, setContractId] = useState('GC-DEMO001');
  const [companyName, setCompanyName] = useState('Tiruppur Textiles');
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axiosOriginal.get(`${apiBase}/api/carbon/history`);
      setCerts(res.data);
    } catch (e) {
      console.error('Failed to load certificates:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleTokenize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId.trim()) return;

    setIsTokenizing(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      await axiosOriginal.post(`${apiBase}/api/carbon/tokenize`, {
        contract_id: contractId,
        company_name: companyName
      });
      setContractId('');
      loadHistory();
    } catch (error) {
      console.error('Tokenization failed:', error);
    } finally {
      setIsTokenizing(false);
    }
  };

  const handleDownload = (certId: string) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    window.open(`${apiBase}/api/carbon/certificate/${certId}`, '_blank');
  };

  // Aggregated stats
  const totalCredits = certs.reduce((acc, c) => acc + c.carbon_credits, 0);
  const totalValue = certs.reduce((acc, c) => acc + c.market_value_inr, 0);
  const totalCO2 = certs.reduce((acc, c) => acc + c.co2_saved_kg, 0) / 1000.0; // in tons

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Award className="w-5 h-5 text-[#3FE6A8]" />
            CARBON CREDIT TOKENIZATION LEDGER
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Convert verified ESG ledger CO2 offset outputs into tradeable, PDF-backed carbon certificates.
          </p>
        </div>
        <button
          onClick={loadHistory}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#09171C] border border-[#1B3A38]/30 hover:border-[#3FE6A8]/40 text-xs font-bold text-[#B9C4CC] transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#30D5FF] ${loadingHistory ? 'animate-spin' : ''}`} />
          Reload Ledger
        </button>
      </div>

      {/* Credit stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[130px]">
          <div className="absolute top-0 right-0 w-[80px] h-[80px] rounded-full bg-[#3FE6A8]/5 blur-[20px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Equivalent CO₂ Offset</span>
          <h3 className="text-3xl font-black text-[#F5F7FA] tracking-tight">
            {totalCO2.toFixed(2)} <span className="text-sm font-bold text-[#6F8088]">MT CO2e</span>
          </h3>
        </div>

        <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[130px]">
          <div className="absolute top-0 right-0 w-[80px] h-[80px] rounded-full bg-[#30D5FF]/5 blur-[20px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Issued Carbon Credits</span>
          <h3 className="text-3xl font-black text-[#F5F7FA] tracking-tight">
            {totalCredits.toFixed(2)} <span className="text-sm font-bold text-[#6F8088]">Credits</span>
          </h3>
        </div>

        <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[130px]">
          <div className="absolute top-0 right-0 w-[80px] h-[80px] rounded-full bg-[#5CFFB5]/5 blur-[20px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Estimated Asset Valuation</span>
          <h3 className="text-3xl font-black text-[#F5F7FA] tracking-tight text-[#3FE6A8]">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tokenize contract form */}
        <div className="p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-black text-[#F5F7FA] uppercase tracking-wider">Tokenize Asset Contract</h3>
            <p className="text-[10px] text-[#B9C4CC] mt-0.5">Submit an ESG contract ID to tokenize corresponding CO2 savings.</p>
          </div>

          <form onSubmit={handleTokenize} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Origin Company</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-4 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">ESG Contract ID</label>
              <input
                type="text"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                placeholder="e.g. GC-AUDIT0001"
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-4 text-xs text-[#F5F7FA] font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isTokenizing}
              className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3 px-5 rounded-[12px]"
            >
              <PlusCircle className="w-4 h-4" />
              {isTokenizing ? "Processing tokenization..." : "Mint Carbon Certificate"}
            </button>
          </form>
        </div>

        {/* Historic certificates list */}
        <div className="lg:col-span-2 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-4">
          <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#30D5FF]" />
            Active Tokenized Carbon Registry
          </span>

          <div className="overflow-x-auto pr-2">
            <table className="w-full text-left text-xs text-[#B9C4CC] border-collapse">
              <thead>
                <tr className="border-b border-[#1B3A38]/20 text-[9px] uppercase tracking-wider font-mono text-[#6F8088]">
                  <th className="py-2.5 px-3">Certificate ID</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3 text-right">Credits (MT)</th>
                  <th className="py-2.5 px-3 text-right">Valuation (INR)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {certs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#6F8088] font-bold">
                      No carbon credit tokens minted yet. Use the generator panel to get started.
                    </td>
                  </tr>
                ) : (
                  certs.map((c, idx) => (
                    <tr key={idx} className="border-b border-[#1B3A38]/10 hover:bg-[#09171C]/40 transition">
                      <td className="py-3 px-3 font-mono font-bold text-[#F5F7FA]">{c.certificate_id}</td>
                      <td className="py-3 px-3">{c.company_name}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#30D5FF]">{c.carbon_credits.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#3FE6A8]">₹{c.market_value_inr.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/30 text-[#3FE6A8] border border-[#3FE6A8]/20">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDownload(c.certificate_id)}
                          className="px-3 py-1 rounded-[8px] bg-[#09171C] border border-[#1B3A38]/40 hover:border-[#3FE6A8]/60 text-[9px] font-bold text-[#F5F7FA] transition cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Download className="w-3 h-3 text-[#30D5FF]" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
export default CarbonCredits;
