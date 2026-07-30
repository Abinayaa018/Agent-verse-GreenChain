import React, { useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ShieldCheck, ShieldAlert, Sparkles, Send, Eye, RefreshCw } from 'lucide-react';

interface FraudData {
  fraud_probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fraud_reasons: string[];
  duplicate_detected: boolean;
  recommended_action: string;
}

export const FraudDetection: React.FC = () => {
  const [transactionId, setTransactionId] = useState('TX-104921');
  const [buyer, setBuyer] = useState('Tiruppur Textiles');
  const [seller, setSeller] = useState('Coimbatore E-Hub');
  const [material, setMaterial] = useState('plastic');
  const [quantity, setQuantity] = useState('2500');
  const [price, setPrice] = useState('32');
  const [distance, setDistance] = useState('110');
  const [trustScore, setTrustScore] = useState('8.5');
  const [paymentDelay, setPaymentDelay] = useState('15');
  const [duplicateContract, setDuplicateContract] = useState(false);
  const [data, setData] = useState<FraudData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/fraud-detection`, {
        transaction_id: transactionId,
        buyer,
        seller,
        material,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        distance: parseFloat(distance),
        trust_score: parseFloat(trustScore),
        payment_delay: parseInt(paymentDelay),
        duplicate_contract: duplicateContract
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to calculate transaction fraud:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const buyers = ["Tiruppur Textiles", "EcoFibre Ltd", "Electro-Recycle", "Kovai Paper Mills"];
  const sellers = ["Chennai Polymers", "Salem Steel", "Coimbatore E-Hub", "Salem Scrap Yard"];
  const materials = ["plastic", "metal", "battery", "paper", "textile"];

  // Mock historical transaction fraud risks
  const chartData = [
    { name: 'TX-104889', risk: 0.12 },
    { name: 'TX-104890', risk: 0.08 },
    { name: 'TX-104891', risk: 0.95 },
    { name: 'TX-104892', risk: 0.18 },
    { name: `Current (${transactionId})`, risk: data ? data.fraud_probability : 0.15 }
  ];

  const getBarColor = (val: number) => {
    if (val >= 0.85) return '#EF4444'; // critical red
    if (val >= 0.65) return '#F59E0B'; // high amber
    if (val >= 0.35) return '#30D5FF'; // medium cyan
    return '#3FE6A8'; // low green
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameters Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#3FE6A8]" />
            FRAUD DETECTION
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Verify smart contract transactions using Isolation Forest and MLP Autoencoder reconstructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Buyer</label>
              <select
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
              >
                {buyers.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Seller</label>
              <select
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
              >
                {sellers.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
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
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Trust</label>
              <input
                type="number"
                step="0.1"
                value={trustScore}
                onChange={(e) => setTrustScore(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Pay Delay (days)</label>
              <input
                type="number"
                value={paymentDelay}
                onChange={(e) => setPaymentDelay(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Material</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2 px-3 text-xs text-[#F5F7FA]"
              >
                {materials.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="duplicate"
              checked={duplicateContract}
              onChange={(e) => setDuplicateContract(e.target.checked)}
              className="w-4 h-4 rounded bg-[#09171C] border-[#1B3A38]/40 accent-[#3FE6A8]"
            />
            <label htmlFor="duplicate" className="text-xs font-bold text-[#B9C4CC] cursor-pointer">
              Simulate contract duplicate check
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3 px-5 rounded-[12px]"
          >
            {isLoading ? "Auditing parameters..." : "Audit Transaction Threat"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome Results */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No transactions audited yet. Fill details to check contract threat profiles.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Risk profile cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[130px] relative overflow-hidden">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Fraud Probability</span>
                <h3 className={`text-4xl font-black tracking-tight ${getBarColor(data.fraud_probability) === '#EF4444' ? 'text-red-400' : 'text-[#F5F7FA]'}`}>
                  {(data.fraud_probability * 100).toFixed(0)}%
                </h3>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[130px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Assessed Threat</span>
                <span className={`text-xl font-black uppercase ${
                  data.risk_level === 'CRITICAL' || data.risk_level === 'HIGH' ? 'text-red-400' : data.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-[#3FE6A8]'
                }`}>{data.risk_level} RISK</span>
              </div>

              <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[130px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Contract Duplicate</span>
                <span className="text-xs font-bold text-[#F5F7FA]">
                  {data.duplicate_detected ? "FLAGGED DUPLICATE" : "CLEAN contract copy"}
                </span>
              </div>
            </div>

            {/* Suspicious alerts checklist */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-red-400" /> Highlighted Suspicious Fields</span>
              {data.fraud_reasons.length === 0 ? (
                <p className="text-xs font-bold text-[#3FE6A8]">No anomaly triggers identified. Transaction parameters fit standard operational boundaries.</p>
              ) : (
                <div className="flex flex-col gap-2 pl-3 relative border-l border-red-500/30">
                  {data.fraud_reasons.map((reason, idx) => (
                    <div key={idx} className="relative py-0.5">
                      <span className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                      <p className="text-xs text-[#B9C4CC] font-medium">{reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended compliance advisory action */}
            <div className="p-5 rounded-[20px] bg-[#081318]/50 border border-[#1B3A38]/20 flex flex-col gap-2">
              <h4 className="text-[10px] font-black text-[#F5F7FA] uppercase tracking-wider">Recommended Compliance Action</h4>
              <p className="text-xs text-[#B9C4CC] leading-relaxed font-bold">{data.recommended_action}</p>
            </div>

            {/* Risk profile comparison chart */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> Threat index compared to recent audits
              </span>

              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(27, 58, 56, 0.1)" />
                    <XAxis dataKey="name" stroke="#6F8088" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 1]} stroke="#6F8088" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#061016',
                        borderColor: '#1B3A38',
                        borderRadius: '12px',
                        color: '#F5F7FA',
                        fontSize: '10px'
                      }}
                    />
                    <Bar dataKey="risk" name="Threat Risk">
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={getBarColor(entry.risk)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default FraudDetection;
