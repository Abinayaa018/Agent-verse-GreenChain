import React from 'react';
import { Bell, Search, User, Globe } from 'lucide-react';

interface NavbarProps {
  currentCompany: string;
  onCompanyChange: (company: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentCompany, onCompanyChange }) => {
  return (
    <header className="h-16 bg-[#050B0F] border-b border-[#1B3A38] px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Search Bar */}
      <div className="flex items-center bg-[#081318] border border-[#1B3A38] rounded-[16px] px-3 py-1.5 w-72 focus-within:border-[#3FE6A8]/50 transition-all justify-between">
        <div className="flex items-center flex-1">
          <Search size={18} className="text-text-muted mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search audit ledger, matches..."
            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder-text-muted"
          />
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-text-muted bg-gray-100/10 px-1.5 py-0.5 rounded border border-[#1B3A38] select-none">
          ⌘K
        </kbd>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-6">
        {/* Company Switcher */}
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#3FE6A8]" />
          <select
            value={currentCompany}
            onChange={(e) => onCompanyChange(e.target.value)}
            className="text-sm font-semibold bg-[#081318] border border-[#1B3A38] rounded-[16px] py-1.5 px-3 text-text-primary outline-none focus:border-[#3FE6A8]"
          >
            <option value="Tiruppur Textiles">Tiruppur Textiles</option>
            <option value="EcoFibre Ltd">EcoFibre Ltd</option>
            <option value="Electro-Recycle">Electro-Recycle</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-text-secondary">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-[#050B0F]"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#1B3A38]">
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">Admin Portal</p>
            <p className="text-xs text-text-secondary">Industrial Operations</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#3FE6A8] text-[#050B0F] flex items-center justify-center font-bold text-sm shadow-md">
            A
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
