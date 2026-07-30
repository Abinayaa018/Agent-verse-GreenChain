import React, { useEffect, useState } from 'react';
import { History, Leaf, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { HistoryEntry } from '../types';

interface HistoryProps {
  company: string;
}

export const HistoryPage: React.FC<HistoryProps> = ({ company }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(company);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [company]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Audit Ledger History
          </h1>
          <p className="text-text-secondary mt-1">
            Browse verified transaction contracts and environmental offsets registered on the GreenChain block ledger.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg w-full"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-text-muted font-medium">
                  <th className="py-3 px-4">Contract ID</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Quantity (kg)</th>
                  <th className="py-3 px-4">CO₂ Displaced (kg)</th>
                  <th className="py-3 px-4">Landfill Diverted (kg)</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((item) => (
                  <tr key={item.contract_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-text-primary">{item.contract_id}</td>
                    <td className="py-3 px-4 text-text-secondary capitalize">{item.material_type}</td>
                    <td className="py-3 px-4 text-text-primary font-semibold">{item.quantity_kg.toLocaleString()}</td>
                    <td className="py-3 px-4 text-primary-green font-bold flex items-center gap-1">
                      <Leaf size={14} />
                      {item.co2_saved_kg.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-text-primary font-semibold">{item.landfill_diverted_kg.toLocaleString()}</td>
                    <td className="py-3 px-4 text-text-secondary">{item.timestamp.split('T')[0]}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-green bg-primary-green/10 py-1 px-2.5 rounded-full">
                        <ShieldCheck size={14} />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-text-muted">
                      No historical contracts found in ledger. Submit waste logs to initialize.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default HistoryPage;
