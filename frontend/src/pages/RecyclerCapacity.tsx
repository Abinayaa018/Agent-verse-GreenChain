import React, { useState } from 'react';
import axios from 'axios';
import { Layers, ShieldCheck, MapPin, DollarSign, Clock, HelpCircle, Send } from 'lucide-react';

interface Alternative {
  facility: string;
  available_capacity: number;
  processing_fee: number;
  distance: number;
}

interface CapacityRecommendation {
  recommended_facility: string;
  available_capacity: number;
  waiting_time: number;
  distance: number;
  processing_fee: number;
  confidence: number;
  alternatives: Alternative[];
}

export const RecyclerCapacity: React.FC = () => {
  const [material, setMaterial] = useState('plastic');
  const [quantity, setQuantity] = useState('1000');
  const [city, setCity] = useState('Tiruppur');
  const [data, setData] = useState<CapacityRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/recycling-capacity`, {
        params: {
          material,
          quantity: parseFloat(quantity),
          city
        }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch recycling capacity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const cities = ['Tiruppur', 'Chennai', 'Coimbatore', 'Madurai', 'Bangalore'];
  const materials = ['plastic', 'metal', 'battery', 'paper', 'glass', 'textile', 'organic'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameter Inputs Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#3FE6A8]" />
            RECYCLING CAPACITY
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Monitor current municipal facility capacities, load ratios, and waiting queues before routing waste.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Material Class</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {materials.map((m) => (
                <option key={m} value={m}>{m.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Waste Quantity (kg)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">City Location</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs font-bold text-[#F5F7FA] cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Querying capacity database..." : "Evaluate Processing Capabilities"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Capacity Results */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No capacity data loaded. Query parameters to check active recycler capacities.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Top Recommended Facility Card */}
            <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between min-h-[180px]">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] rounded-full bg-[#3FE6A8]/5 blur-[35px] pointer-events-none" />
              
              <div className="flex justify-between items-start border-b border-[#1B3A38]/20 pb-3">
                <div>
                  <span className="text-[9px] font-black uppercase text-[#30D5FF] tracking-widest font-mono">TOP RECOMMENDED FACILITY</span>
                  <h3 className="text-lg font-black text-[#F5F7FA] mt-0.5">{data.recommended_facility}</h3>
                </div>
                <span className="text-[10px] font-mono text-[#6F8088] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3FE6A8]" /> Confidence: {(data.confidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Clock className="w-3 h-3 text-[#30D5FF]" /> Waiting Queue</span>
                  <p className="text-sm font-black text-[#F5F7FA]">{data.waiting_time} Hours</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><MapPin className="w-3 h-3 text-[#3FE6A8]" /> Distance</span>
                  <p className="text-sm font-black text-[#F5F7FA]">{data.distance} km</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><DollarSign className="w-3 h-3 text-[#5CFFB5]" /> Process Fee</span>
                  <p className="text-sm font-black text-[#F5F7FA]">₹{data.processing_fee} / kg</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Layers className="w-3 h-3 text-red-400" /> Free Capacity</span>
                  <p className="text-sm font-black text-[#F5F7FA]">{data.available_capacity.toLocaleString()} kg</p>
                </div>
              </div>
            </div>

            {/* Alternative options list */}
            <div className="p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Compatible Alternative Facilities</span>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#B9C4CC] border-collapse">
                  <thead>
                    <tr className="border-b border-[#1B3A38]/20 text-[9px] uppercase tracking-wider font-mono text-[#6F8088]">
                      <th className="py-2.5 px-3">Recycler Facility</th>
                      <th className="py-2.5 px-3 text-right">Free Capacity (kg)</th>
                      <th className="py-2.5 px-3 text-right">Fee (INR/kg)</th>
                      <th className="py-2.5 px-3 text-right">Distance (km)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.alternatives.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-[#6F8088] font-bold">
                          No alternative facilities meet parameters in this cluster.
                        </td>
                      </tr>
                    ) : (
                      data.alternatives.map((alt, idx) => (
                        <tr key={idx} className="border-b border-[#1B3A38]/10 hover:bg-[#09171C]/40 transition">
                          <td className="py-3 px-3 font-bold text-[#F5F7FA]">{alt.facility}</td>
                          <td className="py-3 px-3 text-right font-mono text-[#30D5FF]">{alt.available_capacity.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono text-[#3FE6A8]">₹{alt.processing_fee.toFixed(2)}</td>
                          <td className="py-3 px-3 text-right font-mono text-[#B9C4CC]">{alt.distance}</td>
                        </tr>
                      ))
                    )}
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
export default RecyclerCapacity;
