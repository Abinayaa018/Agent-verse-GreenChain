import React, { useState, useEffect } from 'react';
import { Languages, ShieldCheck, HelpCircle } from 'lucide-react';

export const LanguageSettings: React.FC = () => {
  const [lang, setLang] = useState('English');

  useEffect(() => {
    setLang(localStorage.getItem('greenchain_lang') || 'English');
  }, []);

  const selectLanguage = (newLang: string) => {
    localStorage.setItem('greenchain_lang', newLang);
    setLang(newLang);
    window.dispatchEvent(new Event('greenchain_lang_changed'));
    // Reload window so entire UI applies translations
    window.location.reload();
  };

  const languageOptions = [
    { code: 'English', label: 'English', sub: 'Standard System Interface' },
    { code: 'Tamil', label: 'தமிழ்', sub: 'Tamil Regional Translation' },
    { code: 'Hindi', label: 'हिन्दी', sub: 'Hindi Regional Translation' },
    { code: 'Kannada', label: 'ಕನ್ನಡ', sub: 'Kannada Regional Translation' },
    { code: 'Malayalam', label: 'മലയാളம்', sub: 'Malayalam Regional Translation' },
    { code: 'Telugu', label: 'తెలుగు', sub: 'Telugu Regional Translation' }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="p-6 rounded-[20px] bg-[#081318]/80 border border-[#1B3A38]/30 backdrop-blur-md">
        <h2 className="text-xl font-black text-[#F5F7FA] tracking-wide flex items-center gap-2">
          <Languages className="w-5 h-5 text-[#30D5FF]" />
          REGIONAL LANGUAGE LOCALIZATION SETTINGS
        </h2>
        <p className="text-xs text-[#B9C4CC] mt-1">
          Configure preferred language for conversational chatbot responses and automated circular economy analytics labels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languageOptions.map((opt) => (
          <button
            key={opt.code}
            onClick={() => selectLanguage(opt.code)}
            className={`p-5 rounded-[20px] border text-left transition flex justify-between items-center cursor-pointer ${
              lang === opt.code
                ? 'bg-[#30D5FF]/10 border-[#30D5FF]/40 text-[#F5F7FA] shadow-[0_0_15px_rgba(48,213,255,0.05)]'
                : 'bg-[#09171C]/80 border-[#1B3A38]/20 text-[#B9C4CC] hover:bg-[#09171C] hover:border-[#1B3A38]/40'
            }`}
          >
            <div>
              <h3 className="text-base font-black tracking-wide">{opt.label}</h3>
              <p className="text-[10px] text-[#6F8088] mt-0.5">{opt.sub}</p>
            </div>
            {lang === opt.code && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#30D5FF] shadow-[0_0_8px_#30D5FF]" />
            )}
          </button>
        ))}
      </div>

      <div className="p-5 rounded-[16px] bg-[#09171C] border border-[#1B3A38]/20 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-[#3FE6A8] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-[#F5F7FA]">AI Translation Layer</h4>
          <p className="text-[#B9C4CC] leading-relaxed">
            The platform automatically processes chatbot intents and summaries through Gemini translation. Dashboard components load translation bundles based on your selection.
          </p>
        </div>
      </div>
    </div>
  );
};
export default LanguageSettings;
