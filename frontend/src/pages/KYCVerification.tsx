import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, FileText, CheckCircle2, XCircle, Clock, Send, Upload } from 'lucide-react';

interface KYCRecord {
  id: string;
  company_name: string;
  gst_number: string;
  pan: string;
  reg_number: string;
  email: string;
  phone: string;
  factory_address: string;
  document_url: string | null;
  status: 'Verified' | 'Pending' | 'Rejected';
  timestamp: string;
  remarks: string;
}

export const KYCVerification: React.FC = () => {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [form, setForm] = useState({
    company_name: 'Tiruppur Textiles',
    gst_number: '33AAAAA1111A1Z1',
    pan: 'AAAAA1111A',
    reg_number: 'U12345TZ2026PLC123456',
    email: 'compliance@tiruppurtextiles.com',
    phone: '9876543210',
    factory_address: '12, Industrial Area, Avinashi Road, Tiruppur - 641603',
  });
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionOutcome, setSubmissionOutcome] = useState<KYCRecord | null>(null);

  // Load verification history
  const loadHistory = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/kyc/history`);
      setRecords(res.data);
    } catch (e) {
      console.error('Failed to load KYC records:', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleMockUpload = () => {
    // Generate a mock document URL representing standard PDF upload
    setDocumentUrl(`https://greenchain.storage/docs/gst_cert_${Math.floor(Math.random() * 90000) + 10000}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionOutcome(null);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/kyc/verify`, {
        ...form,
        document_url: documentUrl
      });
      setSubmissionOutcome(res.data);
      loadHistory();
    } catch (error) {
      console.error('KYC verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      
      {/* Verification submission Form */}
      <div className="lg:col-span-2 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#3FE6A8]" />
            KYC VERIFICATION GATEKEEPER
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Validate company registration details and upload regulatory credentials to unlock marketplace trading.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleInputChange}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[14px] py-3 px-4 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">CIN Registration Number</label>
              <input
                type="text"
                name="reg_number"
                value={form.reg_number}
                onChange={handleInputChange}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[14px] py-3 px-4 text-xs text-[#F5F7FA]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">GSTIN (15 Digits)</label>
              <input
                type="text"
                name="gst_number"
                value={form.gst_number}
                onChange={handleInputChange}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[14px] py-3 px-4 text-xs text-[#F5F7FA] font-mono"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">PAN (10 Digits)</label>
              <input
                type="text"
                name="pan"
                value={form.pan}
                onChange={handleInputChange}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[14px] py-3 px-4 text-xs text-[#F5F7FA] font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Business Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[14px] py-3 px-4 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[14px] py-3 px-4 text-xs text-[#F5F7FA]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Factory Physical Address</label>
            <textarea
              name="factory_address"
              value={form.factory_address}
              onChange={handleInputChange}
              rows={2}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[14px] py-3 px-4 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-[16px] bg-[#09171C]/50 border border-[#1B3A38]/20">
            <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">GST Certificate Document Upload</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleMockUpload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#09171C] border border-[#1B3A38]/40 hover:bg-[#09171C]/80 hover:border-[#3FE6A8]/40 text-xs font-bold text-[#B9C4CC] transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#3FE6A8]" />
                Select File
              </button>
              <span className="text-xs font-mono text-[#6F8088]">
                {documentUrl ? `✓ gst_registration_cert.pdf` : "No document selected"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[14px]"
          >
            {isSubmitting ? "Executing verification checks..." : "Submit KYC Dossier"}
            <Send className="w-4 h-4" />
          </button>
        </form>

        {submissionOutcome && (
          <div className={`p-4 rounded-[16px] border ${
            submissionOutcome.status === 'Verified' 
              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
              : submissionOutcome.status === 'Pending'
              ? 'bg-amber-950/20 border-amber-900/40 text-amber-400'
              : 'bg-red-950/20 border-red-900/40 text-red-400'
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
              {submissionOutcome.status === 'Verified' ? <CheckCircle2 className="w-4 h-4" /> : submissionOutcome.status === 'Pending' ? <Clock className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              Outcome: {submissionOutcome.status}
            </h4>
            <p className="text-xs">{submissionOutcome.remarks}</p>
          </div>
        )}
      </div>

      {/* Verification timeline and history */}
      <div className="flex flex-col gap-6">
        
        {/* Verification Status Summary card */}
        <div className="p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-4">
          <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Current Status</span>
          
          {records.length > 0 && records[records.length - 1].status === 'Verified' ? (
            <div className="flex items-center gap-3 p-4 rounded-[16px] bg-emerald-950/20 border border-emerald-900/40">
              <ShieldCheck className="w-10 h-10 text-[#3FE6A8] animate-pulse" />
              <div>
                <h3 className="text-base font-black text-[#F5F7FA] tracking-wide">VERIFIED TRUST</h3>
                <p className="text-[10px] text-[#3FE6A8] font-bold">GSTIN/PAN authenticated</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-[16px] bg-amber-950/20 border border-amber-900/40">
              <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
              <div>
                <h3 className="text-base font-black text-[#F5F7FA] tracking-wide">PENDING INITIAL KYC</h3>
                <p className="text-[10px] text-amber-400 font-bold">GST document required</p>
              </div>
            </div>
          )}
        </div>

        {/* Verification log timeline */}
        <div className="p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-4 flex-1">
          <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Verification Registry Log</span>
          
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
            {records.length === 0 ? (
              <p className="text-xs text-[#6F8088]">No submissions registered yet.</p>
            ) : (
              records.map((r, idx) => (
                <div key={idx} className="flex gap-3 border-l border-[#1B3A38]/30 pl-4 py-1 relative">
                  <div className={`absolute left-[-5px] top-2.5 w-2.5 h-2.5 rounded-full ${
                    r.status === 'Verified' 
                      ? 'bg-[#3FE6A8] shadow-[0_0_8px_#3FE6A8]' 
                      : r.status === 'Pending'
                      ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                      : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                  }`} />
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-[#F5F7FA]">{r.company_name}</span>
                      <span className="text-[9px] font-mono text-[#6F8088]">{r.timestamp.substring(0, 10)}</span>
                    </div>
                    <p className="text-[10px] text-[#B9C4CC] leading-relaxed">{r.remarks}</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        r.status === 'Verified' 
                          ? 'bg-emerald-950/30 text-[#3FE6A8]'
                          : r.status === 'Pending'
                          ? 'bg-amber-950/30 text-amber-400'
                          : 'bg-red-950/30 text-red-400'
                      }`}>
                        {r.status}
                      </span>
                      {r.document_url && (
                        <a
                          href={r.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[8px] font-bold text-[#30D5FF] hover:underline flex items-center gap-0.5 font-mono"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          View GST Certificate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
export default KYCVerification;
