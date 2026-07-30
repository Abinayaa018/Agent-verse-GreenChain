import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { Award, Compass, Sparkles, Building2, Globe, ShieldAlert, MapPin } from 'lucide-react';

interface BenchmarkData {
  industry_rank: number;
  state_rank: number;
  national_rank: number;
  industry_average: { [key: string]: number };
  company_score: { [key: string]: number };
  benchmark_gap: { [key: string]: number };
  recommendations: string[];
}

interface ESGBenchmarkProps {
  company: string;
}

export const ESGBenchmark: React.FC<ESGBenchmarkProps> = ({ company }) => {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async (compName: string) => {
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiBase}/api/esg-benchmark`, {
        params: { company_name: compName }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load ESG benchmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(company);
  }, [company]);

  // Transform metrics to Recharts Radar format
  const radarData = data 
    ? [
        {
          subject: 'Recycling Rate (%)',
          Company: data.company_score.recycling_rate,
          Industry: data.industry_average.recycling_rate
        },
        {
          subject: 'Circularity (%)',
          Company: data.company_score.circularity,
          Industry: data.industry_average.circularity
        },
        {
          subject: 'Landfill Diversion (%)',
          Company: data.company_score.landfill_diversion,
          Industry: data.industry_average.landfill_diversion
        }
      ]
    : [];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Info Panel */}
      <div className="p-5 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#3FE6A8]" />
            ESG BENCHMARKING
          </h2>
          <p className="text-xs text-[#B9C4CC]">
            Compare circularity rates, recycling efficiency ratios, and landfill diversion levels against local and national industry bounds.
          </p>
        </div>
        <div className="bg-[#09171C] border border-[#1B3A38] rounded-[12px] px-4 py-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#3FE6A8]" />
          <span className="text-xs font-black text-[#F5F7FA]">{company.toUpperCase()}</span>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="p-12 rounded-[20px] bg-[#081318]/40 border border-[#1B3A38]/10 text-center text-xs font-bold text-[#6F8088]">
          Aggregating company audit history and computing benchmarks...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left rankings panel */}
          <div className="flex flex-col gap-6">
            {/* National Rank */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[120px]">
              <div className="absolute top-0 right-0 w-[100px] h-[100px] rounded-full bg-[#30D5FF]/5 blur-[25px] pointer-events-none" />
              <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-[#30D5FF]" /> NATIONAL RANK</span>
              <h3 className="text-3xl font-black text-[#F5F7FA]">#{data.national_rank} <span className="text-[10px] font-bold text-[#6F8088]">/ 950</span></h3>
            </div>

            {/* State Rank */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[120px]">
              <div className="absolute top-0 right-0 w-[100px] h-[100px] rounded-full bg-[#3FE6A8]/5 blur-[25px] pointer-events-none" />
              <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#3FE6A8]" /> REGIONAL RANK</span>
              <h3 className="text-3xl font-black text-[#F5F7FA]">#{data.state_rank} <span className="text-[10px] font-bold text-[#6F8088]">/ 180</span></h3>
            </div>

            {/* Industry Rank */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 relative overflow-hidden flex flex-col justify-between h-[120px]">
              <div className="absolute top-0 right-0 w-[100px] h-[100px] rounded-full bg-[#5CFFB5]/5 blur-[25px] pointer-events-none" />
              <span className="text-[9px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1"><Award className="w-3.5 h-3.5 text-[#5CFFB5]" /> SECTOR RANK</span>
              <h3 className="text-3xl font-black text-[#F5F7FA]">#{data.industry_rank} <span className="text-[10px] font-bold text-[#6F8088]">/ 50</span></h3>
            </div>
          </div>

          {/* Center Radar Chart */}
          <div className="p-6 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4 relative overflow-hidden min-h-[300px]">
            <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3FE6A8]" /> ESG Performance Radar Gap
            </span>

            <div className="h-[260px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(27, 58, 56, 0.2)" />
                  <PolarAngleAxis dataKey="subject" stroke="#6F8088" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6F8088" fontSize={8} />
                  <Radar name="My Company" dataKey="Company" stroke="#3FE6A8" fill="#3FE6A8" fillOpacity={0.25} />
                  <Radar name="Industry Avg" dataKey="Industry" stroke="#30D5FF" fill="#30D5FF" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#061016',
                      borderColor: '#1B3A38',
                      borderRadius: '12px',
                      color: '#F5F7FA',
                      fontSize: '11px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Recommendations Panel */}
          <div className="flex flex-col gap-6">
            
            {/* Progress Bars comparison */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono">Performance Bars</span>
              
              <div className="space-y-3">
                {Object.keys(data.company_score).map((k) => (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#B9C4CC] uppercase">{k.replace('_', ' ')}</span>
                      <span className="text-[#3FE6A8] font-mono">{data.company_score[k]}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#081318] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#3FE6A8] to-[#5CFFB5] rounded-full"
                        style={{ width: `${data.company_score[k]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gap advisory recommendations */}
            <div className="p-5 rounded-[20px] bg-[#09171C] border border-[#1B3A38]/30 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-[#6F8088] tracking-widest font-mono flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Gap Advisory Recommendations</span>
              <div className="flex flex-col gap-3">
                {data.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-xs text-[#B9C4CC] leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8] mt-1.5 flex-shrink-0" />
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
export default ESGBenchmark;
