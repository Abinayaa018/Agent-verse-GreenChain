import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, Cpu, Bell } from 'lucide-react';
import Toast, { ToastType } from '../components/Toast';

export const SettingsPage: React.FC = () => {
  const [cpcbThreshold, setCpcbThreshold] = useState('70');
  const [useOrs, setUseOrs] = useState(true);
  const [alertEmails, setAlertEmails] = useState('esg@greenchain.ai');

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('System configurations updated successfully!');
    setToastType('success');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Platform Settings
        </h1>
        <p className="text-text-secondary mt-1">
          Adjust environmental analysis parameters, geocoder connections, and compliance check thresholds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Configurations Form */}
        <form onSubmit={handleSave} className="md:col-span-2 space-y-6">
          {/* CPCB rules card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 space-y-4">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <ShieldAlert className="text-primary-green" size={20} />
              Compliance Rulesets Configuration
            </h3>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Circularity Penalty Purity Threshold (%)
              </label>
              <input
                type="number"
                value={cpcbThreshold}
                onChange={(e) => setCpcbThreshold(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-green"
              />
              <span className="text-[10px] text-text-muted mt-1 block">
                Transactions falling below this threshold trigger quality valuation discounts on the marketplace pricing agent.
              </span>
            </div>
          </div>

          {/* Logistics settings card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 space-y-4">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <Cpu className="text-primary-green" size={20} />
              Developer API Settings
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">OpenRouteService Geocoding</p>
                <p className="text-xs text-text-secondary">Toggle ORS queries for directions and fallback lines.</p>
              </div>
              <input
                type="checkbox"
                checked={useOrs}
                onChange={(e) => setUseOrs(e.target.checked)}
                className="w-4 h-4 text-primary-green rounded border-gray-300 focus:ring-primary-green"
              />
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 space-y-4">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <Bell className="text-primary-green" size={20} />
              ESG Alarm Recipient
            </h3>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                E-mail address for violations alerts
              </label>
              <input
                type="email"
                value={alertEmails}
                onChange={(e) => setAlertEmails(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-green"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-primary-green hover:bg-primary-hover text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md text-sm"
          >
            <Save size={18} />
            Save Configurations
          </button>
        </form>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
export default SettingsPage;
