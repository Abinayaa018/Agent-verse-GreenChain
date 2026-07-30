import React, { useState } from 'react';
import axios from 'axios';
import { Send, FileText, Download, ShieldCheck, Key, RefreshCw } from 'lucide-react';

interface ContractData {
  contract_id: str;
  pdf_filename: str;
  contract_json: str;
  signature_hash: str;
  version: number;
}

export const SmartContractPage: React.FC = () => {
  const [seller, setSeller] = useState('Coimbatore E-Hub');
  const [buyer, setBuyer] = useState('Tiruppur Textiles');
  const [material, setMaterial] = useState('plastic');
  const [quantity, setQuantity] = useState('5000');
  const [price, setPrice] = useState('22');
  const [deliveryClause, setDeliveryClause] = useState('FOB origin. Shipment dispatch within 3 business days.');
  const [paymentClause, setPaymentClause] = useState('Net 15 days upon container weight receipt confirmation.');
  const [penaltyClause, setPenaltyClause] = useState('1.5% charge per day of delivery delay.');
  const [data, setData] = useState<ContractData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/smart-contract/generate`, {
        seller,
        buyer,
        material,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        delivery_clause: deliveryClause,
        payment_clause: paymentClause,
        penalty_clause: penaltyClause
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to compile smart contract:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    window.open(`${apiBase}/api/smart-contract/download/${data.contract_id}`);
  };

  const buyers = ["Tiruppur Textiles", "EcoFibre Ltd", "Electro-Recycle", "Kovai Paper Mills"];
  const sellers = ["Chennai Polymers", "Salem Steel", "Coimbatore E-Hub", "Salem Scrap Yard"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Drafting inputs */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3FE6A8]" />
            DRAFT AGREEMENT
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Draft legal agreement clauses and sign smart contracts with SHA256 consensus hashing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Seller name</label>
              <select
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
              >
                {sellers.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Buyer name</label>
              <select
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
              >
                {buyers.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 col-span-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Material</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Qty (kg)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Delivery Clauses</label>
            <textarea
              rows={2}
              value={deliveryClause}
              onChange={(e) => setDeliveryClause(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA] font-medium resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Payment Clauses</label>
            <textarea
              rows={2}
              value={paymentClause}
              onChange={(e) => setPaymentClause(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA] font-medium resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Default Penalty Clauses</label>
            <textarea
              rows={2}
              value={penaltyClause}
              onChange={(e) => setPenaltyClause(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA] font-medium resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3 px-5 rounded-[12px]"
          >
            {isLoading ? "Compiling PDF Flowables..." : "Draft & Digitally Sign Contract"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome panels */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              Contract queue empty. Fill draft clauses parameters to generate document assets.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Metadata KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Contract ID</span>
                <h3 className="text-xl font-black text-[#F5F7FA] tracking-tight">{data.contract_id}</h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Doc Version</span>
                <h3 className="text-2xl font-black text-[#3FE6A8]">v{data.version}.0</h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[120px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Document Format</span>
                <span className="text-xs font-bold text-[#30D5FF] uppercase">PDF Flowable + Metadata JSON</span>
              </div>
            </div>

            {/* Verification Signature Hash */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-[#3FE6A8]" /> Digital Consensus Verification</span>
              <div className="bg-[#081318] p-4 rounded-[14px] border border-[#1B3A38]/30">
                <p className="text-[10px] font-mono text-[#3FE6A8] break-all">{data.signature_hash}</p>
              </div>
            </div>

            {/* Actions panel */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="text-sm font-black text-[#F5F7FA]">LEGAL DOCUMENT READY</h4>
                <p className="text-xs text-[#B9C4CC]">Compiled using ReportLab and signed. Download certified PDF copy.</p>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 btn-primary-glow font-bold text-xs py-3 px-6 rounded-[12px] self-stretch md:self-auto justify-center"
              >
                <Download className="w-4 h-4" /> Download PDF Contract
              </button>
            </div>

            {/* Metadata JSON display */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-[#30D5FF]" /> Contract Registry Metadata</span>
              <pre className="bg-[#081318] p-4 rounded-[14px] border border-[#1B3A38]/30 text-[10px] font-mono text-[#B9C4CC] overflow-x-auto">
                {data.contract_json}
              </pre>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default SmartContractPage;
