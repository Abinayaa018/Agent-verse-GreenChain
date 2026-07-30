import React, { useState } from 'react';
import axios from 'axios';
import { Send, FileText, CheckCircle, ShieldCheck, QrCode, Clock, Navigation, Plus } from 'lucide-react';

interface CheckpointItem {
  timestamp: string;
  location: string;
  handler: string;
  status: string;
  gps: string;
  verified: boolean;
}

interface TraceabilityData {
  passport_id: string;
  material_type: string;
  quantity: number;
  origin_city: string;
  checkpoints: CheckpointItem[];
  verification_hash: string;
  qr_code_path: string;
}

export const WasteTraceabilityPage: React.FC = () => {
  const [passportId, setPassportId] = useState('GC-PASS-100234');
  const [data, setData] = useState<TraceabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Checkpoint adding inputs
  const [handler, setHandler] = useState('Tiruppur Textiles Operator');
  const [location, setLocation] = useState('Tiruppur Weaving Plant');
  const [status, setStatus] = useState('collected raw cotton scraps');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/traceability/${passportId}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load traceability details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/traceability/checkpoint`, {
        passport_id: passportId,
        handler,
        location,
        status
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to log check-in:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Panel */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Passport search */}
        <div className="p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#3FE6A8]" />
              MATERIAL PASSPORT TRACKER
            </h2>
            <p className="text-[11px] text-[#B9C4CC] mt-1">
              Load barcode passport timelines and review custody logs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Passport Code</label>
              <input
                type="text"
                value={passportId}
                onChange={(e) => setPassportId(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3 px-5 rounded-[12px]"
            >
              {isLoading ? "Querying Ledgers..." : "Retrieve Custody passport"}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Add checkpoint check-in */}
        {data && (
          <div className="p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#30D5FF]" />
                CHECK-IN LOG REGISTRY
              </h2>
              <p className="text-[11px] text-[#B9C4CC] mt-1">
                Log a new checkpoint custody event along the shipping chain.
              </p>
            </div>

            <form onSubmit={handleAddCheckpoint} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Operator Handler</label>
                <input
                  type="text"
                  value={handler}
                  onChange={(e) => setHandler(e.target.value)}
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

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Status Action</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3 px-5 rounded-[12px]"
              >
                Log Checkpoint Event
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <QrCode className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              Consensus registry idle. Propose a material passport code to search.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Header info */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex justify-between items-center h-[120px]">
              <div>
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Passport material</span>
                <h3 className="text-2xl font-black text-[#F5F7FA] mt-1">{data.material_type.toUpperCase()} ({data.quantity} kg)</h3>
                <p className="text-xs text-[#3FE6A8] mt-1 font-bold">Origin: {data.origin_city}</p>
              </div>
              <div className="w-14 h-14 rounded-[12px] bg-[#081318] border border-[#1B3A38]/30 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-[#30D5FF]" />
              </div>
            </div>

            {/* Signature Hash consensus */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#3FE6A8]" /> Blockchain Validation Proof</span>
              <div className="bg-[#081318] p-4 rounded-[14px] border border-[#1B3A38]/30">
                <p className="text-[10px] font-mono text-[#3FE6A8] break-all">{data.verification_hash}</p>
              </div>
            </div>

            {/* Custody timeline */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Custody Timeline Track</span>
              
              <div className="flex flex-col gap-6 pl-4 relative border-l border-[#1B3A38]/30">
                {data.checkpoints.map((check, idx) => (
                  <div key={idx} className="relative py-1">
                    <span className="absolute left-[-21px] top-2.5 w-2.5 h-2.5 rounded-full bg-[#30D5FF] shadow-[0_0_6px_#30D5FF]" />
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px] font-black text-[#6F8088] font-mono">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#30D5FF]" />{check.timestamp}</span>
                        <span>GPS: {check.gps}</span>
                      </div>
                      <h4 className="text-xs font-black text-[#F5F7FA] mt-1">{check.location}</h4>
                      <p className="text-[11px] text-[#B9C4CC] font-bold">Status: {check.status} (Handler: {check.handler})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default WasteTraceabilityPage;
