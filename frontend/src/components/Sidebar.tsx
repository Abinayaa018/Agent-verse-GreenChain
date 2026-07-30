import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Binary,
  ShoppingBag,
  Shuffle,
  Leaf,
  IndianRupee,
  Truck,
  ShieldCheck,
  Lightbulb,
  FileText,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Settings2,
  MessageSquare,
  TrendingUp,
  Award,
  Languages
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/waste-analysis', label: 'Waste Analysis', icon: Binary },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { path: '/resource-matching', label: 'Resource Matching', icon: Shuffle },
  { path: '/environmental-impact', label: 'Environmental Impact', icon: Leaf },
  { path: '/economic-value', label: 'Economic Value', icon: IndianRupee },
  { path: '/logistics', label: 'Logistics Mapping', icon: Truck },
  { path: '/compliance', label: 'Compliance Checks', icon: ShieldCheck },
  { path: '/circular-innovation', label: 'Circular Innovation', icon: Lightbulb },
  { path: '/audit-reports', label: 'Audit Reports', icon: FileText },
  { path: '/history', label: 'Transaction History', icon: History },
  
  // New Integrated Intelligent Agents
  { path: '/chatbot', label: 'Chatbot', icon: MessageSquare },
  { path: '/kyc', label: 'KYC Verification', icon: ShieldCheck },
  { path: '/pricing', label: 'Dynamic Pricing', icon: TrendingUp },
  { path: '/carbon-credits', label: 'Carbon Credits', icon: Award },
  { path: '/language-settings', label: 'Language Settings', icon: Languages },

  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#061016] border-r border-[#1B3A38] text-[#F5F7FA] flex flex-col justify-between transition-all duration-300 z-30 shadow-xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo Branding */}
        <div className="p-5 flex items-center justify-between border-b border-[#1B3A38]">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* SVG Logo */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <rect width="100" height="100" rx="20" fill="#183A6B" />
              <path
                d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15ZM40 68L25 53L32 46L40 54L68 26L75 33L40 68Z"
                fill="#16C784"
              />
              <path
                d="M50 30C38.95 30 30 38.95 30 50C30 61.05 38.95 70 50 70C61.05 70 70 61.05 70 50C70 38.95 61.05 30 50 30ZM45 60L35 50L39.67 45.33L45 50.67L60.33 35.33L65 40L45 60Z"
                fill="#7EF9B7"
              />
            </svg>
            {!isCollapsed && (
              <span className="font-extrabold text-lg tracking-wider text-accent-mint font-sans whitespace-nowrap">
                GREEN-CHAIN
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-[#09171C] border border-[#1B3A38] hover:border-[#3FE6A8] hover:bg-[#3FE6A8]/5 transition-all text-[#F5F7FA]"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-[#3FE6A8]/10 text-[#3FE6A8] border border-[#3FE6A8]/30 shadow-[0_0_15px_rgba(63,230,168,0.15)] opacity-100'
                      : 'text-[#B9C4CC] opacity-50 hover:opacity-100 hover:text-[#F5F7FA] hover:bg-[#F5F7FA]/5'
                  }`
                }
              >
                <Icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                
                {/* Tooltip on Hover in Collapsed Mode */}
                {isCollapsed && (
                  <div className="absolute left-20 bg-slate-dark text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ESG Score / Footer Card */}
      <div className="p-4 border-t border-[#1B3A38] overflow-hidden">
        {!isCollapsed ? (
          <div className="bg-[#09171C] border border-[#1B3A38] hover:border-[#3FE6A8]/30 rounded-[16px] p-3 flex items-center gap-3 transition-colors">
            {/* SVG Circular Progress Dial */}
            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                <circle
                  className="text-white/5"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  fill="transparent"
                  r="18"
                  cx="24"
                  cy="24"
                />
                <circle
                  className="text-[#2ebd93]"
                  strokeWidth="2.5"
                  strokeDasharray="113.1"
                  strokeDashoffset={113.1 - (82.5 / 100) * 113.1}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="18"
                  cx="24"
                  cy="24"
                />
              </svg>
              <div className="relative text-[9px] font-black text-[#2ebd93] z-10">
                82.5%
              </div>
            </div>
            {/* Right stack info */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider leading-none">ESG Score</p>
              <h4 className="text-sm font-black text-[#F5F7FA] leading-tight mt-0.5">82.5%</h4>
              <p className="text-[8px] font-bold text-primary-green leading-none mt-1">↑ 8.4% vs last month</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            {/* Compact circular dial for collapsed mode */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                <circle
                  className="text-white/5"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="transparent"
                  r="12"
                  cx="16"
                  cy="16"
                />
                <circle
                  className="text-[#2ebd93]"
                  strokeWidth="2"
                  strokeDasharray="75.4"
                  strokeDashoffset={75.4 - (82.5 / 100) * 75.4}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="12"
                  cx="16"
                  cy="16"
                />
              </svg>
              <span className="text-[7px] font-black text-[#2ebd93]">82%</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
