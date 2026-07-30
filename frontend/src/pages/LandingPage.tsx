import React from 'react';
import { Link } from 'react-router-dom';
import HolographicGlobe from '../components/HolographicGlobe';
import DigitalTwinBackground from '../components/DigitalTwinBackground';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#050B0F] overflow-hidden flex flex-col justify-center items-center px-6 py-12 md:px-12 lg:px-24">
      
      {/* Digital Twin Ambient background under 8% opacity */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <DigitalTwinBackground />
      </div>

      {/* Grid line overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none tech-grid opacity-30" />

      {/* Volumetric background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-br from-[#3FE6A8]/5 to-transparent blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-tl from-[#2DD4FF]/5 to-transparent blur-[120px]" />

      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side Hero Details */}
        <div className="flex flex-col items-start text-left space-y-8 max-w-xl">
          
          {/* Logo badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#09161C] border border-[#1B3A38]/40 shadow-[0_0_15px_rgba(63,230,168,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3FE6A8] animate-pulse" />
            <span className="text-[10px] font-black text-[#3FE6A8] tracking-widest uppercase font-mono">
              SYSTEM ONLINE // ENTERPRISE AI
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#F5F7FA] font-sans leading-none uppercase">
              Green-Chain <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3FE6A8] to-[#2DD4FF]">AI</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-[#B9C4CC] leading-relaxed">
              Industrial Circular Intelligence powered by Artificial Intelligence, enabling intelligent waste optimization, real-time ESG insights, smart resource matchmaking, and sustainable manufacturing ecosystems.
            </p>
          </div>

          <p className="text-sm text-[#6F8088] leading-relaxed">
            Green-Chain transforms industrial waste into measurable value through AI-driven analytics, digital resource matching, predictive intelligence, and real-time sustainability monitoring.
          </p>

          {/* Action CTA Button */}
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 btn-primary-glow font-bold text-sm py-3.5 px-8 rounded-[18px]"
            >
              Explore Platform
              <span className="text-base font-normal">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Right Side Centerpiece: Holographic 3D Globe */}
        <div className="flex justify-center items-center">
          <HolographicGlobe />
        </div>

      </div>

      {/* Bottom system footer */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-center text-[9px] font-mono text-[#6F8088] tracking-widest z-10">
        <div>ORBITAL HUB ID: GC-PLATFORM-V4</div>
        <div className="mt-2 sm:mt-0">© 2026 GREEN-CHAIN AI. SECURED PROTOCOL LOGS</div>
      </div>
    </div>
  );
};
export default LandingPage;
