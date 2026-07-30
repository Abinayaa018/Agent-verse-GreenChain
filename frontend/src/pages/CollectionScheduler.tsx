import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, User, Truck, Clock, MapPin, Send, HelpCircle } from 'lucide-react';

interface PickupSchedule {
  pickup_time: string;
  driver: string;
  vehicle: string;
  ETA: string;
  optimized_route: string[];
  recycler: str;
}

export const CollectionScheduler: React.FC = () => {
  const [material, setMaterial] = useState('plastic');
  const [quantity, setQuantity] = useState('1000');
  const [city, setCity] = useState('Tiruppur');
  const [urgency, setUrgency] = useState('medium');
  const [schedule, setSchedule] = useState<PickupSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${apiBase}/api/schedule-pickup`, {
        material,
        quantity: parseFloat(quantity),
        city,
        urgency,
        company: 'Tiruppur Textiles'
      });
      setSchedule(res.data);
    } catch (err) {
      console.error('Failed to schedule pickup:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const cities = ['Tiruppur', 'Chennai', 'Coimbatore', 'Madurai', 'Bangalore'];
  const materials = ['plastic', 'metal', 'battery', 'paper', 'textile', 'organic'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Parameters Panel */}
      <div className="lg:col-span-1 p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#3FE6A8]" />
            COLLECTION SCHEDULER
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Schedule automated pickup dispatch cycles matching vehicle load limits and driver availability.
          </p>
        </div>

        <form onSubmit={handleSchedule} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Waste Material</label>
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
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Quantity (kg)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-[#09171C] border border-[#1B3A38]/30 rounded-[12px] py-3 px-4 text-xs text-[#F5F7FA]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Location City</label>
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

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Urgency Coefficient</label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map((urg) => (
                <button
                  key={urg}
                  type="button"
                  onClick={() => setUrgency(urg)}
                  className={`py-2 rounded-[10px] border text-xs font-black uppercase tracking-wider transition ${
                    urgency === urg
                      ? 'bg-[#3FE6A8]/10 border-[#3FE6A8] text-[#3FE6A8]'
                      : 'bg-[#09171C] border-[#1B3A38]/30 text-[#B9C4CC] hover:bg-[#09171C]/80'
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 btn-primary-glow font-bold text-xs py-3.5 px-6 rounded-[12px]"
          >
            {isLoading ? "Optimizing logistics resource path..." : "Schedule Dispatch Pick-run"}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Schedule Outcome Display */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!schedule ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-[#30D5FF] animate-pulse" />
            <p className="text-xs font-bold text-[#6F8088]">
              No active schedules. Assign parameters in the dispatcher module to compute optimized collection routes.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* assigned details cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-[16px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[100px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><User className="w-3 h-3 text-[#30D5FF]" /> DRIVER</span>
                <span className="text-xs font-black text-[#F5F7FA]">{schedule.driver}</span>
              </div>
              <div className="p-4 rounded-[16px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[100px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Truck className="w-3 h-3 text-[#3FE6A8]" /> VEHICLE</span>
                <span className="text-xs font-black text-[#F5F7FA] line-clamp-2">{schedule.vehicle}</span>
              </div>
              <div className="p-4 rounded-[16px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[100px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Clock className="w-3 h-3 text-[#5CFFB5]" /> ETA</span>
                <span className="text-xs font-black text-[#F5F7FA]">{schedule.ETA}</span>
              </div>
              <div className="p-4 rounded-[16px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col justify-between h-[100px]">
                <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><MapPin className="w-3 h-3 text-red-400" /> RECYCLER</span>
                <span className="text-xs font-black text-[#F5F7FA] line-clamp-2">{schedule.recycler}</span>
              </div>
            </div>

            {/* Timetable schedule waypoints */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Route list */}
              <div className="md:col-span-1 p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Optimized Waypoints</span>
                <div className="flex flex-col gap-4 pl-3 relative border-l border-[#1B3A38]/20">
                  {schedule.optimized_route.map((pt, idx) => (
                    <div key={idx} className="relative py-0.5">
                      <span className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#3FE6A8] shadow-[0_0_6px_#3FE6A8]" />
                      <p className="text-[10px] text-[#B9C4CC] leading-normal">{pt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="md:col-span-2 p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4 relative overflow-hidden h-[240px]">
                <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Transit Route Blueprint</span>
                
                {/* Decorative Map canvas grid */}
                <div className="absolute inset-0 bg-[#050B0F] border border-[#1B3A38]/10 rounded-[14px] m-6 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1B3A38_1px,transparent_1px),linear-gradient(to_bottom,#1B3A38_1px,transparent_1px)] bg-[size:15px_15px]" />
                  
                  {/* Decorative node points & path drawing */}
                  <svg className="w-full h-full p-6 relative z-10" viewBox="0 0 200 100">
                    <line x1="30" y1="50" x2="100" y2="30" stroke="#30D5FF" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="100" y1="30" x2="170" y2="60" stroke="#3FE6A8" strokeWidth="2" />
                    
                    <circle cx="30" cy="50" r="5" fill="#30D5FF" />
                    <circle cx="100" cy="30" r="4" fill="#5CFFB5" />
                    <circle cx="170" cy="60" r="6" fill="#3FE6A8" />
                    
                    <text x="30" y="65" fill="#B9C4CC" fontSize="6" textAnchor="middle">ORIGIN</text>
                    <text x="100" y="20" fill="#B9C4CC" fontSize="6" textAnchor="middle">HUB-WEIGHT</text>
                    <text x="170" y="75" fill="#B9C4CC" fontSize="6" textAnchor="middle">RECYCLER</text>
                  </svg>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default CollectionScheduler;
