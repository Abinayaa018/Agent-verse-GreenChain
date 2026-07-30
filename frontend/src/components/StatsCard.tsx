import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  circleBadge?: string;      // Status badge overlapping the circular track
  circleProgress?: number;    // Radial progress fill percent
  showValueInCircle?: string; // Text to show in place of Lucide Icon
  statusTag?: 'LIVE' | 'AI VERIFIED' | 'REAL-TIME'; // Module status indicator
  sparklineData?: number[];  // Mini trend graph points
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  subtext,
  trend,
  circleBadge,
  circleProgress,
  showValueInCircle,
  statusTag,
  sparklineData,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-[#09171C] rounded-[20px] p-6 shadow-card border border-[#1B3A38] animate-pulse flex flex-col justify-between h-[255px]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-150/10 mb-4"></div>
          <div className="h-3 bg-gray-150/20 rounded w-2/3 mb-2"></div>
          <div className="h-6 bg-gray-150/20 rounded w-1/2"></div>
        </div>
        <div className="h-3 bg-gray-150/20 rounded w-3/4 mt-4 mx-auto"></div>
      </div>
    );
  }

  // Circular gauge config
  const radius = 26;
  const strokeWidth = 2.5;
  const circumference = radius * 2 * Math.PI;
  const fillProgress = circleProgress !== undefined ? circleProgress : 100;
  const strokeDashoffset = circumference - (fillProgress / 100) * circumference;

  const isSolidBadge = circleBadge === '90%' || circleBadge === 'Gold tier';
  const badgeClass = isSolidBadge
    ? 'bg-[#1b3a38] text-[#F5F7FA] border border-[#3FE6A8]/40 font-bold'
    : 'bg-[#3FE6A8]/10 text-[#3FE6A8] border border-[#3FE6A8]/20 font-bold';

  // Plot sparkline path dynamically
  const renderSparkline = (data?: number[]) => {
    if (!data || data.length === 0) return null;
    const width = 100;
    const height = 18;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;

    return (
      <div className="mt-3.5 w-full flex items-center justify-between border-t border-[#1B3A38] pt-2.5 flex-shrink-0">
        <span className="text-[8px] font-black text-[#6F8088] tracking-wider uppercase">Trend</span>
        <svg className="w-[85px] h-[18px] text-[#3FE6A8] opacity-75 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glowing stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="blur-[1.5px] opacity-40"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-[#09171C] rounded-[20px] p-6 shadow-card border border-[#1B3A38] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-cardHover hover:border-[#3FE6A8]/30 flex flex-col justify-between items-center text-center relative h-[255px] overflow-hidden group">
      
      {/* Top Right Live/Verified Status Chip */}
      {statusTag && (
        <span className={`absolute top-4 right-4 text-[7px] font-black px-1.5 py-0.5 rounded tracking-widest flex items-center gap-1 select-none border ${
          statusTag === 'LIVE'
            ? 'border-red-500/20 text-red-400 bg-red-950/10'
            : statusTag === 'AI VERIFIED'
            ? 'border-blue-500/20 text-blue-400 bg-blue-950/10'
            : 'border-[#3FE6A8]/20 text-[#3FE6A8] bg-[#3FE6A8]/5'
        }`}>
          {statusTag === 'LIVE' && <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>}
          {statusTag}
        </span>
      )}

      {/* Top Section: Circular Progress / Icon */}
      <div className="relative w-16 h-16 flex items-center justify-center mb-3 mt-1 flex-shrink-0 filter drop-shadow-[0_0_8px_rgba(63,230,168,0.12)]">
        
        {/* SVG Circle Gauge */}
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 64 64">
          <circle
            className="text-white/5"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
          />
          <circle
            className="text-[#3FE6A8]"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
          />
        </svg>

        {/* Center content */}
        <div className="relative text-[#3FE6A8] z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          {showValueInCircle ? (
            <span className="text-lg font-black font-sans leading-none">{showValueInCircle}</span>
          ) : (
            <Icon size={18} />
          )}
        </div>

        {/* Overlapping Status Badge */}
        {circleBadge && (
          <span className={`absolute bottom-0 -left-2 text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-lg z-20 ${badgeClass}`}>
            {circleBadge}
          </span>
        )}
      </div>

      {/* Middle Section: Label & Value Stacked */}
      <div className="space-y-1 flex-1 flex flex-col justify-center">
        <p className="text-[10px] font-bold text-[#B9C4CC] tracking-wider uppercase leading-none">
          {title}
        </p>
        <h3 className="text-2xl font-black text-[#F5F7FA] tracking-tight leading-none">
          {value}
        </h3>
      </div>

      {/* Bottom Section: Trend Metrics */}
      <div className="mt-3.5 flex items-center justify-center gap-1.5 w-full flex-shrink-0">
        {trend && (
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
              trend.isPositive
                ? 'bg-[#3FE6A8]/10 text-[#3FE6A8]'
                : 'bg-danger/10 text-danger'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
        {subtext && <span className="text-[9px] text-[#6F8088] font-medium truncate max-w-[125px]">{subtext}</span>}
      </div>

      {/* Sparkline trend graph */}
      {renderSparkline(sparklineData)}

    </div>
  );
};
export default StatsCard;
