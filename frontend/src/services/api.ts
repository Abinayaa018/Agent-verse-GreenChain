import axios from 'axios';
import {
  AnalysisResponse,
  DashboardResponse,
  HistoryEntry,
  ESGReport,
  MarketplaceResponse,
  LogisticsResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getHealth: async () => {
    const res = await client.get('/api/health');
    return res.data;
  },

  analyzeWaste: async (formData: FormData): Promise<AnalysisResponse> => {
    const res = await client.post('/api/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getDashboard: async (companyName = 'Tiruppur Textiles'): Promise<DashboardResponse> => {
    const res = await client.get(`/api/dashboard?company_name=${encodeURIComponent(companyName)}`);
    return res.data;
  },

  getHistory: async (companyName = 'Tiruppur Textiles'): Promise<HistoryEntry[]> => {
    const res = await client.get(`/api/history?company_name=${encodeURIComponent(companyName)}`);
    return res.data;
  },

  getReports: async (companyName = 'Tiruppur Textiles'): Promise<ESGReport[]> => {
    const res = await client.get(`/api/reports?company_name=${encodeURIComponent(companyName)}`);
    return res.data;
  },

  generateReport: async (companyName = 'Tiruppur Textiles'): Promise<{ status: string; filename: string }> => {
    const params = new URLSearchParams();
    params.append('company_name', companyName);
    const res = await client.post('/api/reports/generate', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return res.data;
  },

  getMarketplace: async (): Promise<MarketplaceResponse> => {
    const res = await client.get('/api/marketplace');
    return res.data;
  },

  submitMarketplaceTransaction: async (data: {
    material_type: string;
    quantity_kg: number;
    seller_name: string;
    buyer_name: string;
    proposed_price_inr: number;
  }) => {
    const res = await client.post('/api/marketplace/transaction', data);
    return res.data;
  },

  getLogistics: async (
    source: string,
    destination: string,
    quantityKg: number,
    material: string
  ): Promise<LogisticsResponse> => {
    const res = await client.get(
      `/api/logistics?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(
        destination
      )}&quantity_kg=${quantityKg}&material=${encodeURIComponent(material)}`
    );
    return res.data;
  },
};
export default api;
