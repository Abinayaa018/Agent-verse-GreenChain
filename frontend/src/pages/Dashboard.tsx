import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Leaf,
  IndianRupee,
  Trash2,
  Percent,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { DashboardResponse } from '../types';
import StatsCard from '../components/StatsCard';

const COLORS = ['#2ebd93', '#35a07c', '#00b8d4', '#3b82f6', '#f59e0b', '#ef4444'];

interface DashboardProps {
  company: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ company }) => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.getDashboard(company);
        setData(res);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [company]);

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* Cyber Wave Glow Banner Behind Header */}
      <div className="absolute -top-6 right-0 left-0 h-[280px] pointer-events-none overflow-hidden -z-10 opacity-35">
        <svg className="w-full h-full min-w-[1200px]" viewBox="0 0 1440 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#glow)">
            <path d="M-100 200 C300 240 600 80 1000 120 C1200 140 1400 60 1600 80" stroke="#2ebd93" strokeWidth="2.5" strokeOpacity="0.8" />
            <path d="M-100 210 C400 190 700 120 1100 100 C1300 90 1400 120 1600 50" stroke="#35a07c" strokeWidth="1.5" strokeOpacity="0.5" />
            <path d="M-100 170 C200 230 500 60 900 150 C1100 190 1300 80 1600 100" stroke="#2ebd93" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.4" />
          </g>
          <defs>
            <filter id="glow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary uppercase">
            Industrial Waste Intelligence
          </h1>
          <p className="text-text-secondary mt-1">
            Real-time ESG metrics, AI matchmaking, and regulatory logs for <span className="font-bold text-deep-emerald">{company}</span>.
          </p>
        </div>
        <Link
          to="/waste-analysis"
          className="flex items-center justify-center gap-2 btn-secondary-glow text-[#F5F7FA] font-bold py-2.5 px-5 rounded-[18px]"
        >
          <span className="text-lg font-normal leading-none">+</span>
          New Waste Analysis
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 relative z-10">
        <StatsCard
          title="Waste Processed"
          value={loading ? 0 : `${data?.total_waste_processed || 0} T`}
          icon={Trash2}
          subtext="Total mass registered"
          trend={{ value: '12.4%', isPositive: true }}
          statusTag="REAL-TIME"
          sparklineData={[12, 19, 15, 25, 22, 30, 31.5]}
          loading={loading}
        />
        <StatsCard
          title="Revenue Generated"
          value={loading ? 0 : `₹${data?.revenue_generated?.toLocaleString('en-IN') || 0}`}
          icon={IndianRupee}
          showValueInCircle="₹"
          subtext="From matched materials"
          trend={{ value: '8.3%', isPositive: true }}
          statusTag="LIVE"
          sparklineData={[10, 12, 11, 15, 13, 16, 15.1]}
          loading={loading}
        />
        <StatsCard
          title="CO₂ Avoided"
          value={loading ? 0 : `${data?.co2_saved?.toLocaleString() || 0} kg`}
          icon={Leaf}
          subtext="Scope 3 displacement"
          trend={{ value: '14.2%', isPositive: true }}
          statusTag="AI VERIFIED"
          sparklineData={[120, 135, 110, 148, 130, 155, 161.7]}
          loading={loading}
        />
        <StatsCard
          title="Landfill Diverted"
          value={loading ? 0 : `${data?.landfill_diverted || 0} T`}
          icon={Package}
          circleProgress={90}
          circleBadge="90%"
          subtext="Verified reuse streams"
          statusTag="REAL-TIME"
          sparklineData={[20, 22, 25, 23, 27, 26, 28.35]}
          loading={loading}
        />
        <StatsCard
          title="Circularity Score"
          value={loading ? 0 : `${data?.circularity_score || 0}%`}
          icon={Percent}
          showValueInCircle="%"
          circleProgress={data?.circularity_score || 82.5}
          circleBadge="Gold tier"
          subtext="Platform average rating"
          statusTag="AI VERIFIED"
          sparklineData={[75, 78, 80, 79, 81, 83, 82.5]}
          loading={loading}
        />
        <StatsCard
          title="Marketplace Deals"
          value={loading ? 0 : data?.marketplace_matches || 0}
          icon={CheckCircle}
          circleBadge="Active"
          subtext="Confirmed buyer pairings"
          statusTag="LIVE"
          sparklineData={[3, 5, 4, 7, 6, 8, 9]}
          loading={loading}
        />
      </div>

      {/* AI recommendation insight */}
      <div className="recommendation-streak text-[#F5F7FA] rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-primary-green/20 relative z-10 glassmorphism">
        <div className="flex gap-4">
          {/* Stylized custom strategy icon */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#06241a] to-[#041c14] border border-[#2ebd93]/30 flex items-center justify-center text-primary-green flex-shrink-0 shadow-lg futuristic-glow">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" stroke="#2ebd93" strokeWidth="6" strokeDasharray="10 15" strokeLinecap="round" />
              <path d="M35 50 C35 41.72 41.72 35 50 35 C58.28 35 65 41.72 65 50 C65 58.28 58.28 65 50 65" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <circle cx="50" cy="50" r="10" fill="#2ebd93" />
              <circle cx="35" cy="50" r="4" fill="#3b82f6" />
              <circle cx="65" cy="50" r="4" fill="#3b82f6" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-lg text-[#F5F7FA] flex items-center gap-2">
              Autonomous Circular Strategy Recommendation
            </h4>
            <p className="text-[#B9C4CC] text-sm mt-1 max-w-3xl leading-relaxed">
              Based on historical data for {company}, shifting mixed plastic streams to Pyrolysis processors
              can <span className="text-primary-green font-bold">increase revenue by 18%</span> and <span className="text-primary-green font-bold">double CO₂ displacement</span> metrics this quarter.
            </p>
          </div>
        </div>
        <Link
          to="/circular-innovation"
          className="btn-secondary-glow text-[#F5F7FA] text-sm font-bold py-2.5 px-5 rounded-[18px] flex items-center gap-2 whitespace-nowrap"
        >
          Explore Pathway
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 lg:col-span-2">
          <h3 className="font-bold text-lg text-text-primary mb-4">ESG Impact & Waste Volumetrics</h3>
          <div className="h-80">
            {loading ? (
              <div className="w-full h-full bg-gray-50 animate-pulse rounded-xl"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.charts?.monthly_trend}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ebd93" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2ebd93" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDiverted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(53, 160, 124, 0.1)" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#041c14',
                      borderRadius: '8px',
                      border: '1px solid rgba(53, 160, 124, 0.2)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      color: '#ffffff',
                    }}
                    itemStyle={{ color: '#a9d4c7' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    name="CO₂ Saved (kg)"
                    dataKey="co2"
                    stroke="#2ebd93"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCo2)"
                  />
                  <Area
                    type="monotone"
                    name="Waste Diverted (kg)"
                    dataKey="diverted"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDiverted)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category breakdown donut chart */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50">
          <h3 className="font-bold text-lg text-text-primary mb-4">Material Volume Split</h3>
          <div className="h-80 flex flex-col justify-between">
            {loading ? (
              <div className="w-full h-full bg-gray-50 animate-pulse rounded-xl"></div>
            ) : (
              <>
                <div className="h-60 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.charts?.category_breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data?.charts?.category_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Label */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-2xl font-black text-text-primary">{data?.total_waste_processed || 0} T</p>
                    <p className="text-xs text-text-muted">Total Registered</p>
                  </div>
                </div>
                {/* Legend list */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {data?.charts?.category_breakdown.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center gap-1.5 overflow-hidden">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      ></span>
                      <span className="text-text-secondary truncate">{entry.name}</span>
                      <span className="font-bold text-text-primary">({entry.value}T)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* History log section */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-text-primary">Recent Waste Submissions</h3>
          <Link to="/history" className="text-sm font-semibold text-deep-emerald hover:text-primary-green flex items-center gap-0.5">
            View full ledger
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.recent_analyses.map((item) => (
                  <tr key={item.contract_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-text-primary">{item.contract_id}</td>
                    <td className="py-3 px-4 text-text-secondary capitalize">{item.material_type}</td>
                    <td className="py-3 px-4 text-text-primary font-semibold">{item.quantity_kg.toLocaleString()}</td>
                    <td className="py-3 px-4 text-primary-green font-bold flex items-center gap-1">
                      <Leaf size={14} />
                      {item.co2_saved_kg.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{item.timestamp.split('T')[0]}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-green bg-primary-green/10 py-1 px-2.5 rounded-full">
                        <ShieldCheck size={14} />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
                {(!data || data.recent_analyses.length === 0) && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-text-muted">
                      No recent waste profiles found. Submit waste data to start.
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
export default Dashboard;
