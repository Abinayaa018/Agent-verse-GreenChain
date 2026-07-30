import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, Award, PlusCircle, Check } from 'lucide-react';
import api from '../services/api';
import { CompanyRank, MarketplaceListing } from '../types';
import Toast, { ToastType } from '../components/Toast';

export const Marketplace: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyRank[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [material, setMaterial] = useState('Cotton Scrap');
  const [quantity, setQuantity] = useState(5000);
  const [seller, setSeller] = useState('Tiruppur Textiles');
  const [buyer, setBuyer] = useState('EcoFibre Ltd');
  const [price, setPrice] = useState(120000);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [submitting, setSubmitting] = useState(false);

  const fetchMarketplace = async () => {
    setLoading(true);
    try {
      const data = await api.getMarketplace();
      setCompanies(data.companies);
      setListings(data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitMarketplaceTransaction({
        material_type: material,
        quantity_kg: quantity,
        seller_name: seller,
        buyer_name: buyer,
        proposed_price_inr: price,
      });

      if (res.status === 'confirmed') {
        setToastMessage(`Deal confirmed! Contract ID: ${res.contract_id}`);
        setToastType('success');
      } else if (res.status === 'pending_review') {
        setToastMessage(`Deal pending review due to low trust score. Notes: ${res.notes}`);
        setToastType('warning');
      } else {
        setToastMessage(`Deal rejected. Reason: ${res.notes}`);
        setToastType('error');
      }
      fetchMarketplace(); // reload trust scores
    } catch (err) {
      console.error(err);
      setToastMessage('Transaction submission failed.');
      setToastType('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Resource Marketplace
        </h1>
        <p className="text-text-secondary mt-1">
          Facilitate trades of recycled waste, verify peer business registrations, and trace peer trust rankings recursively computed from compliance histories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Listings list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50">
            <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <ShoppingBag className="text-primary-green" size={20} />
              Open Material Listings
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-lg w-full"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((lst) => (
                  <div
                    key={lst.id}
                    className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow flex justify-between items-start"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-text-muted">{lst.id}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 capitalize">
                          {lst.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-text-primary capitalize">{lst.material}</h4>
                      <p className="text-xs text-text-secondary">Quantity: {lst.quantity}</p>
                      <p className="text-xs text-text-secondary">Seller: {lst.seller}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-sm text-primary-green">{lst.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Record transaction / create deal */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50">
            <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <PlusCircle className="text-primary-green" size={20} />
              Execute Marketplace Exchange
            </h3>

            <form onSubmit={handleTransactionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Material
                </label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-green"
                >
                  <option value="Cotton Scrap">Cotton Scrap</option>
                  <option value="Plastic Scrap">Plastic Scrap</option>
                  <option value="Used Battery Black Mass">Used Battery Black Mass</option>
                  <option value="Glass Bottles">Glass Bottles</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Seller Company
                </label>
                <input
                  type="text"
                  required
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Buyer Company
                </label>
                <input
                  type="text"
                  required
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-green"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Proposed Price (INR)
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-green"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="md:col-span-2 bg-primary-green hover:bg-primary-hover disabled:bg-gray-300 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm mt-2"
              >
                {submitting ? 'Executing Deal...' : 'Verify & Execute Contract'}
              </button>
            </form>
          </div>
        </div>

        {/* Reputation Leaderboard */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 h-fit">
          <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            <Award className="text-primary-green" size={20} />
            Peer Reputation Index
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg w-full"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {companies.map((co, index) => (
                <div
                  key={co.company_name}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-extrabold text-text-muted text-sm w-4">{index + 1}</span>
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-text-primary truncate">{co.company_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-text-secondary">
                          {co.completed_transactions} transactions
                        </span>
                        {co.is_verified && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] bg-primary-green/10 text-primary-green py-0.5 px-1.5 rounded font-black">
                            <ShieldCheck size={10} />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-black px-2.5 py-1 rounded-lg ${
                      co.trust_score >= 80
                        ? 'bg-emerald-50 text-emerald-600'
                        : co.trust_score >= 50
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {co.trust_score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
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
export default Marketplace;
