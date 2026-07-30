import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DigitalTwinBackground from '../components/DigitalTwinBackground';

interface DashboardLayoutProps {
  currentCompany: string;
  onCompanyChange: (company: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentCompany,
  onCompanyChange,
}) => {
  return (
    <div className="dashboard-wrapper relative min-h-screen overflow-hidden">

      {/* Dynamic Digital Twin Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <DigitalTwinBackground />
      </div>


      {/* Sidebar */}
      <Sidebar />


      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        <Navbar
          currentCompany={currentCompany}
          onCompanyChange={onCompanyChange}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <div className="fade-in">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;