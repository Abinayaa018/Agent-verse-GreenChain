import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Navigation, Globe, Compass, Landmark } from 'lucide-react';
import api from '../services/api';
import { LogisticsResponse } from '../types';
import 'leaflet/dist/leaflet.css';

// Leaflet icon fix for Vite bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom component to handle map centering and fit bounds dynamically
const MapRefocus: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
};

export const Logistics: React.FC = () => {
  const [source, setSource] = useState('Tiruppur');
  const [destination, setDestination] = useState('Chennai');
  const [quantity, setQuantity] = useState(5000);
  const [material, setMaterial] = useState('Cotton Scrap');

  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<LogisticsResponse | null>(null);

  const fetchLogistics = async () => {
    setLoading(true);
    try {
      const res = await api.getLogistics(source, destination, quantity, material);
      setRouteData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogistics();
  }, []);

  const handleRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogistics();
  };

  // Convert Lon-Lat coords from API [lng, lat] to Lat-Lon for React Leaflet [lat, lng]
  const leafletRoute = routeData?.route.map((pt) => [pt[1], pt[0]] as [number, number]) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Logistics Routing & Mapping
        </h1>
        <p className="text-text-secondary mt-1">
          Simulate carbon-optimal transport routes, estimate transit timelines, and check logistical efficiency scores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Input Form Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 h-fit space-y-6">
          <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
            <Compass className="text-primary-green" size={20} />
            Route Configurations
          </h3>

          <form onSubmit={handleRouteSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Origin City
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-green"
              >
                <option value="Tiruppur">Tiruppur</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
                <option value="Chennai">Chennai</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Destination City
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-green"
              >
                <option value="Chennai">Chennai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Tiruppur">Tiruppur</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Load Weight (kg)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary-green"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-green hover:bg-primary-hover disabled:bg-gray-300 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Routing...
                </>
              ) : (
                <>
                  <Navigation size={16} />
                  Calculate Route
                </>
              )}
            </button>
          </form>

          {/* Metric Dashboard */}
          {routeData && (
            <div className="pt-6 border-t border-gray-100 space-y-4">
              <h4 className="font-bold text-sm text-text-primary uppercase tracking-wide">
                Logistics Metrics
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Vehicle Class</span>
                  <span className="font-bold text-text-primary capitalize">{routeData.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Estimated Distance</span>
                  <span className="font-bold text-text-primary">{routeData.distance_km} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Transit Duration</span>
                  <span className="font-bold text-text-primary">
                    {Math.round(routeData.duration_minutes / 60)} hrs {routeData.duration_minutes % 60} mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping Cost</span>
                  <span className="font-bold text-text-primary">₹{routeData.transport_cost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">CO₂ Emissions</span>
                  <span className="font-bold text-danger">{routeData.co2_transport} kg</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-text-secondary">Optimization Score</span>
                  <span className="font-black text-primary-green bg-primary-green/10 px-2 py-0.5 rounded">
                    {quantity >= 5000 ? '94/100 (Rail)' : '82/100 (Road)'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Map Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 flex flex-col justify-between min-h-[500px] h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <Globe className="text-primary-green" size={20} />
              Geographic Route Map
            </h3>
            {routeData && (
              <span className="text-xs text-text-secondary">
                {routeData.origin.name} <strong className="text-text-primary">&rarr;</strong> {routeData.destination.name}
              </span>
            )}
          </div>

          <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 z-10">
            {loading ? (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
                <div className="w-10 h-10 border-4 border-primary-green border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : null}

            {routeData && (
              <MapContainer
                center={[routeData.origin.lat, routeData.origin.lng]}
                zoom={7}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {/* Route Polyline */}
                {leafletRoute.length > 0 && (
                  <Polyline positions={leafletRoute} color="#2ebd93" weight={4} opacity={0.8} />
                )}

                {/* Pickup Marker */}
                <Marker position={[routeData.origin.lat, routeData.origin.lng]}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <p className="font-bold text-deep-emerald">Pickup Origin</p>
                      <p className="font-semibold text-text-primary">{routeData.origin.name}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Delivery Marker */}
                <Marker position={[routeData.destination.lat, routeData.destination.lng]}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <p className="font-bold text-text-primary">Delivery Destination</p>
                      <p className="font-semibold text-text-primary">{routeData.destination.name}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Map bounds auto refocus */}
                {leafletRoute.length > 0 && <MapRefocus positions={leafletRoute} />}
              </MapContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Logistics;
