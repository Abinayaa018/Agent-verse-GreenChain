import React, { useEffect, useState } from 'react';
import { FileText, Download, Play, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { ESGReport } from '../types';
import Toast, { ToastType } from '../components/Toast';

interface AuditReportsProps {
  company: string;
}

export const AuditReports: React.FC<AuditReportsProps> = ({ company }) => {
  const [reports, setReports] = useState<ESGReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports(company);
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [company]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const res = await api.generateReport(company);
      setToastMessage(`Audit report created: ${res.filename}`);
      setToastType('success');
      fetchReports();
    } catch (err: any) {
      console.error(err);
      setToastMessage(err.response?.data?.detail || 'Audit generation failed.');
      setToastType('error');
    } finally {
      setGenerating(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F7FA]">
            Audit & ESG Reports
          </h1>
          <p className="text-[#B9C4CC] mt-1">
            Download certified audit reports and generate ESG compliance PDFs recursively aggregated from local ledger entries.
          </p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center justify-center gap-2 btn-primary-glow font-bold py-2.5 px-5 rounded-[18px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-[#050B0F] border-t-transparent rounded-full animate-spin"></div>
              Compiling Ledger...
            </>
          ) : (
            <>
              <Play size={18} />
              Generate Audit Report
            </>
          )}
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-[#F5F7FA]">Audit PDF Documents</h3>
          <button
            onClick={fetchReports}
            className="p-2 rounded-lg hover:bg-white/5 text-[#B9C4CC] hover:text-[#3FE6A8] transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-50/5 animate-pulse rounded-lg w-full"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((rep) => (
              <div
                key={rep.filename}
                className="flex items-center justify-between p-4 border border-gray-150 rounded-[16px] hover:bg-[#3FE6A8]/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                    <FileText size={22} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-[#F5F7FA] truncate">{rep.filename}</p>
                    <p className="text-xs text-[#6F8088] mt-0.5">
                      Created: {rep.created_at.split('T')[0]} &bull; Size: {formatBytes(rep.size_bytes)}
                    </p>
                  </div>
                </div>

                <a
                  href={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/reports/download/${encodeURIComponent(rep.filename)}`}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-gray-150 text-[#B9C4CC] hover:text-[#3FE6A8] hover:border-[#3FE6A8] hover:bg-[#3FE6A8]/5 transition-all"
                >
                  <Download size={18} />
                </a>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-12 text-[#6F8088]">
                No audit PDFs compiled yet. Click the generate button above to create one.
              </div>
            )}
          </div>
        )}
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
export default AuditReports;
