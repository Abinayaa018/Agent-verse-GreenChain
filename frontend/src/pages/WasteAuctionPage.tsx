import React, { useState } from 'react';
import axios from 'axios';
import { Send, Gavel, Timer, AlertTriangle, Sparkles, Plus, Award } from 'lucide-react';

interface BidItem {
  bidder: string;
  amount: number;
  timestamp: string;
}

interface AuctionData {
  winner: string;
  winning_bid: number;
  bid_history: BidItem[];
  average_bid: number;
  outcome_summary: string;
}

export const WasteAuctionPage: React.FC = () => {
  const [auctionId, setAuctionId] = useState('AUC-904128');
  const [material, setMaterial] = useState('plastic');
  const [quantity, setQuantity] = useState('8000');
  const [reservePrice, setReservePrice] = useState('18');
  const [timeLimit, setTimeLimit] = useState('30');
  const [data, setData] = useState<AuctionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/waste-auction/bid`, {
        auction_id: auctionId,
        material_type: material,
        quantity: parseFloat(quantity),
        reserve_price: parseFloat(reservePrice),
        time_limit_mins: parseInt(timeLimit)
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to run waste auction simulation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const materials = ["plastic", "metal", "battery", "paper", "textile"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Gavel className="w-5 h-5 text-[#3FE6A8]" />
            LIVE WASTE AUCTION
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Launch live waste commodity bidding rooms, track recycler bid timelines, and summarize outcomes using Gemini.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Auction ID</label>
            <input
              type="text"
              value={auctionId}
              onChange={(e) => setAuctionId(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Material</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA] cursor-pointer"
              >
                {materials.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Timer (mins)</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Qty (kg)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-2.5 px-3 text-xs text-[#F5F7FA]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Reserve Price (₹)</label>
              <input
                type="number"
                value={reservePrice}
                onChange={(e) => setReservePrice(e.target.value)}
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
            {isLoading ? "Broadcasting Bids..." : "Launch Bid Bidding Room"}
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Outcome logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <Timer className="w-12 h-12 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              Auction rooms idle. Propose materials parameters to listen to active bidding.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Winner highlight card */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[120px]">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-[#3FE6A8]/5 blur-[30px] pointer-events-none" />
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Award className="w-4 h-4 text-[#3FE6A8]" /> Auction Winner Claimed</span>
              <div>
                <h3 className="text-2xl font-black text-[#F5F7FA]">{data.winner}</h3>
                <p className="text-xs text-[#3FE6A8] font-bold mt-1">Winning Bid: ₹{data.winning_bid}/kg (Avg bid: ₹{data.average_bid}/kg)</p>
              </div>
            </div>

            {/* AI Outcome summary */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-3 relative overflow-hidden">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#30D5FF]" /> AI Auctioneer Outcome Analysis</span>
              <p className="text-xs text-[#B9C4CC] leading-relaxed italic font-medium">
                "{data.outcome_summary}"
              </p>
            </div>

            {/* Bids history list table */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Bidding Logs Timeline</span>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1B3A38]/30 text-[#6F8088] font-mono">
                      <th className="pb-3 uppercase tracking-wider font-black">Timestamp</th>
                      <th className="pb-3 uppercase tracking-wider font-black">Recycler Bidder</th>
                      <th className="pb-3 uppercase tracking-wider font-black text-right">Bid amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1B3A38]/10">
                    {data.bid_history.map((bid, idx) => (
                      <tr key={idx} className="hover:bg-[#081318]/30">
                        <td className="py-3 font-mono text-[#6F8088]">{bid.timestamp}</td>
                        <td className="py-3 font-bold text-[#F5F7FA]">{bid.bidder}</td>
                        <td className="py-3 font-black text-[#3FE6A8] text-right">₹{bid.amount}/kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default WasteAuctionPage;
