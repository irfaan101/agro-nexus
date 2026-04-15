import axios from 'axios';
import mockData from '../data/mockMandiData.json';

const BASE_URL = 'https://api.data.gov.in';
const RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const API_KEY = '579b464db56ec23bdd000001a02d583913d449c85bebb4d5fa74463f'; // Placeholder API Key

export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

/**
 * Mandi Analytics Service
 * Fetches real-time data from OGD India API with fallback to local cache.
 */
export const fetchMandiAnalytics = async (filters: { commodity?: string; market?: string } = {}) => {
  try {
    let filterQuery = '';
    if (filters.commodity) {
      filterQuery += `&filters[commodity]=${encodeURIComponent(filters.commodity)}`;
    }
    if (filters.market) {
      filterQuery += `&filters[market]=${encodeURIComponent(filters.market)}`;
    }

    const url = `${BASE_URL}/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=20${filterQuery}`;
    
    const response = await axios.get(url);

    if (response.data && response.data.records && response.data.records.length > 0) {
      return response.data.records as MandiRecord[];
    }

    // Fallback if records are empty
    console.warn('Empty records from API, using local cache.');
    return mockData as MandiRecord[];
  } catch (error: any) {
    // Handle 500, 403 or network errors
    console.error('Mandi API Error:', error.message);
    console.warn('API failed, falling back to local cache for demo.');
    return mockData as MandiRecord[];
  }
};
