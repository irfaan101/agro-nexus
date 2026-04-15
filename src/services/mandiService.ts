import axios from 'axios';
import mockData from '../data/mockMandiData.json';

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = import.meta.env.VITE_MANDI_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';

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

const fetchWithRetry = async (url: string, retries = 3, backoff = 2000): Promise<any> => {
  try {
    return await axios.get(url);
  } catch (error: any) {
    const isRateLimit = error.response?.status === 429;
    const isNetworkError = !error.response;
    const isServerError = error.response?.status >= 500;

    if (retries > 0 && (isRateLimit || isNetworkError || isServerError)) {
      const waitTime = isRateLimit ? backoff * 2 : backoff;
      console.warn(`Mandi API error (${error.response?.status || 'Network'}). Retrying in ${waitTime}ms... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return fetchWithRetry(url, retries - 1, waitTime);
    }
    throw error;
  }
};

export const fetchMandiData = async (offset = 0, limit = 50, filters: Record<string, string> = {}): Promise<{ records: MandiRecord[] }> => {
  try {
    let filterQuery = '';
    Object.entries(filters).forEach(([key, value]) => {
      filterQuery += `&filters[${key}]=${encodeURIComponent(value)}`;
    });

    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=${limit}&offset=${offset}${filterQuery}`;
    const response = await fetchWithRetry(url);
    
    console.log('API Response:', response.data);

    if (response.data && response.data.records && response.data.records.length > 0) {
      return { records: response.data.records };
    }
    
    console.warn('API returned empty records, falling back to mock data.');
    return { records: mockData as MandiRecord[] };
  } catch (error) {
    console.error('Error fetching Mandi data from OGD API:', error);
    console.warn('Falling back to local mock data.');
    return { records: mockData as MandiRecord[] };
  }
};

// Function to generate fake trend data for a commodity
export const getPriceTrend = (basePrice: number) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, index) => {
    // Random variation between -5% and +5%
    const variation = 1 + (Math.random() * 0.1 - 0.05);
    return {
      day,
      price: Math.round(basePrice * variation)
    };
  });
};
