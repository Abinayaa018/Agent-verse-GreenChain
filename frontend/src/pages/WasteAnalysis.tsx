import React, { useState } from 'react';
import {
  Upload,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  Shuffle,
  Lightbulb,
  Cpu,
  FileText,
  DollarSign,
  AlertTriangle,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import api from '../services/api';
import { AnalysisResponse } from '../types';
import Toast, { ToastType } from '../components/Toast';

export const WasteAnalysis: React.FC<{ company: string; onAnalysisSuccess?: (res: AnalysisResponse) => void }> = ({ company, onAnalysisSuccess }) => {
  const [material, setMaterial] = useState('Cotton Scrap');
  const [quantity, setQuantity] = useState('5.0');
  const [location, setLocation] = useState('Tiruppur');
  const [industry, setIndustry] = useState('Textile');
  const [description, setDescription] = useState('100% Cotton offcuts and spinning waste.');
  const [destination, setDestination] = useState('Authorized Recycler');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  
  // Notification states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('material_type', material);
    formData.append('quantity', quantity);
    formData.append('location', location);
    formData.append('industry', industry);
    formData.append('description', description);
    formData.append('company_name', company);
    formData.append('destination', destination);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await api.analyzeWaste(formData);
      setResult(res);
      if (onAnalysisSuccess) {
        onAnalysisSuccess(res);
      }
      setToastMessage('Waste profile successfully analyzed and logged!');
      setToastType('success');
    } catch (err: any) {
      console.error(err);
      setToastMessage(err.response?.data?.detail || 'An error occurred during analysis.');
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          AI Waste Profile Analysis
        </h1>
        <p className="text-text-secondary mt-1">
          Submit material characteristics, physical forms, or upload scanner imagery to invoke the autonomous classifier and compliance models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form Card */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 h-fit lg:col-span-1">
          <h2 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            <Cpu className="text-primary-green" size={20} />
            Input Waste Information
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Material Type
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-text-primary outline-none focus:border-primary-green"
              >
                <option value="Cotton Scrap">Cotton Scrap</option>
                <option value="Plastic Scrap">Plastic Scrap</option>
                <option value="Used Oil">Used Oil</option>
                <option value="Chemical Sludge">Chemical Sludge</option>
                <option value="E-Waste">E-Waste</option>
                <option value="Food Waste">Food Waste</option>
                <option value="Steel Slag">Steel Slag</option>
                <option value="Glass Bottles">Glass Bottles</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Quantity (Tons)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-text-primary outline-none focus:border-primary-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Origin City
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-text-primary outline-none focus:border-primary-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Source Industry
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-text-primary outline-none focus:border-primary-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Destination Facility
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-text-primary outline-none focus:border-primary-green"
              >
                <option value="Authorized Recycler">Authorized Recycler</option>
                <option value="Certified Facility">Certified Facility</option>
                <option value="Composting Site">Composting Site</option>
                <option value="Approved Treatment Plant">Approved Treatment Plant</option>
                <option value="Landfill">Landfill</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-text-primary outline-none focus:border-primary-green resize-none"
              />
            </div>

            {/* Optional Image Upload */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Physical Image (Optional Classifier Input)
              </label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-primary-green transition-colors cursor-pointer relative bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {imagePreview ? (
                  <div className="text-center">
                    <img src={imagePreview} alt="Preview" className="h-28 mx-auto object-cover rounded-lg mb-2" />
                    <span className="text-xs text-text-secondary truncate block max-w-[200px]">
                      {imageFile?.name}
                    </span>
                  </div>
                ) : (
                  <div className="text-center text-text-secondary py-2">
                    <Upload className="mx-auto text-text-muted mb-2" size={24} />
                    <span className="text-xs font-semibold text-deep-emerald block">Upload scan file</span>
                    <span className="text-[10px] text-text-muted block mt-0.5">JPEG, PNG up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-green hover:bg-primary-hover disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md mt-4 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing waste...
                </>
              ) : (
                'Run Agent Pipeline'
              )}
            </button>
          </form>
        </div>

        {/* Output Results panel */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100/50 h-96 flex flex-col justify-center items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <h3 className="font-bold text-text-primary text-lg">Orchestrator Executing Agent Chain</h3>
                <p className="text-text-secondary text-sm max-w-sm mt-1">
                  Querying TensorFlow model classifiers, fetching OpenAlex research evidence, and running the Scikit-learn compliance checkers...
                </p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 h-96 flex flex-col justify-center items-center text-center">
              <ImageIcon className="text-text-muted mb-3" size={48} />
              <h3 className="font-bold text-text-primary text-lg">Results Feed Pending</h3>
              <p className="text-text-secondary text-sm max-w-md mt-1">
                Fill in the waste description or load a material photograph on the left to fire the agents bureau and display the aggregate profile outputs.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6">
              {/* Classification headline & ESG registration */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-text-secondary bg-gray-100 py-1 px-2.5 rounded-full">
                    Waste Classification Profile
                  </span>
                  <h3 className="text-2xl font-black text-text-primary mt-2">
                    {result.material_type}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-secondary mt-1.5">
                    <span>Purity: <strong className="text-text-primary">{result.purity_pct}%</strong></span>
                    <span>Hazard Level: <strong className="text-text-primary">{result.hazard_level}</strong></span>
                    <span>Class confidence: <strong className="text-text-primary">{(result.confidence * 100).toFixed(1)}%</strong></span>
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto">
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                    ESG Ledger Contract
                  </span>
                  <p className="font-mono font-bold text-lg text-text-primary mt-1">{result.contract_id}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-green bg-primary-green/10 py-0.5 px-2 rounded-full mt-1.5">
                    <ShieldCheck size={12} />
                    Committed to Ledger
                  </span>
                </div>
              </div>

              {/* Grid of Agent outputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Environmental Impact card */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                      <Leaf className="text-primary-green" size={18} />
                      Environmental Impact
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">CO₂ Saved</span>
                        <span className="font-bold text-primary-green">{result.environmental_impact.co2_saved_kg.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Landfill Diverted</span>
                        <span className="font-bold text-text-primary">{result.environmental_impact.landfill_diverted_kg.toLocaleString()} kg</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Circularity Score:</span>
                    <span className="font-extrabold text-primary-green text-sm bg-primary-green/10 px-2 py-0.5 rounded">
                      {result.environmental_impact.circularity_score}/100
                    </span>
                  </div>
                </div>

                {/* Economic Value pricing card */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                      <DollarSign className="text-amber-500" size={18} />
                      Economic Value
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Estimated Price</span>
                        <span className="font-bold text-text-primary">₹{result.economic_value.estimated_price.toLocaleString()}/ton</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Price Range</span>
                        <span className="font-bold text-text-primary">{result.economic_value.price_range}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Recommendation:</span>
                    <span className="font-extrabold text-amber-600 text-sm bg-amber-50 px-2 py-0.5 rounded">
                      {result.economic_value.recommendation}
                    </span>
                  </div>
                </div>

                {/* Resource Matching card */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 md:col-span-2">
                  <h4 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Shuffle className="text-blue-500" size={18} />
                    Resource Matching (Buyers Found)
                  </h4>
                  <div className="space-y-3">
                    {result.resource_matching.results.map((match, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-text-primary">
                            {match.buyer_name}
                          </p>
                          <p className="text-xs text-text-secondary italic">
                            "{match.pitch_summary}"
                          </p>
                        </div>
                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full whitespace-nowrap">
                          Score: {match.score.toFixed(1)}/10
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance check card */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-text-primary flex items-center gap-2">
                      <ShieldCheck className="text-emerald-500" size={18} />
                      Regulatory Compliance Verification
                    </h4>
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full ${
                        result.compliance.status === 'PASS'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {result.compliance.status} ({result.compliance.compliance_score}%)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {result.compliance.violations.length > 0 ? (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <AlertTriangle size={14} />
                          Violations flagged by engine:
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {result.compliance.violations.map((v, i) => (
                            <li key={i}>{v}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 font-medium">
                        No critical regulatory violations found. Material meets disposal guidelines.
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-bold text-text-secondary mb-1">Required Permits</p>
                        {result.compliance.required_permits.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {result.compliance.required_permits.map((p, i) => (
                              <span key={i} className="bg-gray-100 text-text-primary px-2 py-0.5 rounded">
                                {p.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-text-muted">None</p>
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-text-secondary mb-1">Required Documents</p>
                        <div className="flex flex-wrap gap-1">
                          {result.compliance.required_documents.map((d, i) => (
                            <span key={i} className="bg-gray-100 text-text-primary px-2 py-0.5 rounded">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Circular Innovation Suggestions */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 md:col-span-2">
                  <h4 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Lightbulb className="text-amber-400" size={18} />
                    Circular Economy Pathways & Research Matches
                  </h4>
                  <div className="space-y-4">
                    {result.circular_innovation.discoveries.map((discovery) => (
                      <div key={discovery.innovation_id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-text-primary">
                            {discovery.title}
                          </h5>
                          <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            TRL {discovery.trl_level}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">
                          {discovery.transformation_pathway}
                        </p>
                        <div className="flex flex-wrap gap-1 text-[10px] text-text-muted">
                          {discovery.industrial_benefits.slice(0, 2).map((b, i) => (
                            <span key={i} className="bg-gray-50 border border-gray-150 px-2 py-0.5 rounded-full">
                              ✓ {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Toast notifications */}
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
export default WasteAnalysis;
