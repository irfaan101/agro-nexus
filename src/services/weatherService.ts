import axios from 'axios';

export interface WeatherData {
  city: string;
  state?: string;
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  wind: number;
  icon: string;
  lat?: number;
  lon?: number;
  // Expanded data
  daily?: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    precipitation: number[];
    windSpeed: number[];
    weatherCode: number[];
  };
  airQuality?: {
    pm25: number;
    pm10: number;
    pollen: {
      grass: number;
      birch: number;
      ragweed: number;
    };
  };
  floodRisk?: {
    discharge: number;
    status: 'Safe' | 'Warning';
  };
  historicalRainfall?: number; // Sum of past 7 days
  soilMoisture?: {
    time: string[];
    values: number[];
  };
  agriculture?: {
    soilTemp: number;
    soilMoisture: number;
  };
  hourly?: {
    time: string[];
    temp: number[];
  };
}

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const FLOOD_URL = 'https://flood-api.open-meteo.com/v1/flood';
const REVERSE_GEO_URL = 'https://nominatim.openstreetmap.org/reverse';

const mapWeatherCode = (code: number): { condition: string; description: string; icon: string } => {
  if (code === 0) return { condition: 'Clear', description: 'Clear sky', icon: '01d' };
  if (code <= 3) return { condition: 'Clouds', description: 'Partly cloudy', icon: '03d' };
  if (code === 45 || code === 48) return { condition: 'Fog', description: 'Foggy', icon: '50d' };
  if (code >= 51 && code <= 57) return { condition: 'Drizzle', description: 'Drizzle', icon: '09d' };
  if (code >= 61 && code <= 67) return { condition: 'Rain', description: 'Rain', icon: '10d' };
  if (code >= 71 && code <= 77) return { condition: 'Snow', description: 'Snow fall', icon: '13d' };
  if (code >= 80 && code <= 82) return { condition: 'Rain', description: 'Rain showers', icon: '09d' };
  if (code >= 85 && code <= 86) return { condition: 'Snow', description: 'Snow showers', icon: '13d' };
  if (code >= 95) return { condition: 'Thunderstorm', description: 'Thunderstorm', icon: '11d' };
  return { condition: 'Clear', description: 'Clear sky', icon: '01d' };
};

const fetchWithRetry = async (url: string, retries = 5, backoff = 2000): Promise<any> => {
  try {
    return await axios.get(url);
  } catch (error: any) {
    const isRateLimit = error.response?.status === 429;
    const isNetworkError = !error.response;
    const isServerError = error.response?.status >= 500;

    if (retries > 0 && (isRateLimit || isNetworkError || isServerError)) {
      const waitTime = isRateLimit ? backoff * 2 : backoff;
      console.warn(`Weather API error (${error.response?.status || 'Network'}). Retrying in ${waitTime}ms... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return fetchWithRetry(url, retries - 1, waitTime);
    }
    throw error;
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<{ city: string; state: string }> => {
  try {
    const url = `${REVERSE_GEO_URL}?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const response = await axios.get(url, { timeout: 5000 }).catch(() => null);
    
    if (!response || !response.data || !response.data.address) {
      return { city: 'Current Location', state: '' };
    }

    const address = response.data.address;
    return {
      city: address.city || address.town || address.village || address.suburb || 'Current Location',
      state: address.state || address.county || ''
    };
  } catch (error) {
    return { city: 'Current Location', state: '' };
  }
};

export const fetchWeatherByCoords = async (lat: number, lon: number, cityName?: string): Promise<WeatherData> => {
  // 1. Fetch Forecast (Current + 7 Days + 7 Past Days + Soil Moisture + Hourly Trend)
  const forecastUrl = `${BASE_URL}?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,soil_temperature_6cm,soil_moisture_3_to_9cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code&hourly=temperature_2m,soil_moisture_3_to_9cm&past_days=7&timezone=auto`;
  
  // 2. Fetch Air Quality
  const aqUrl = `${AIR_QUALITY_URL}?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=pm10,pm2_5,grass_pollen,birch_pollen,ragweed_pollen&timezone=auto`;
  
  // 3. Fetch Flood Risk
  const floodUrl = `${FLOOD_URL}?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&daily=river_discharge&timezone=auto`;

  console.log(`Fetching comprehensive weather data for: ${lat}, ${lon}`);
  
  try {
    const [forecastRes, aqRes, floodRes, locationInfo] = await Promise.all([
      fetchWithRetry(forecastUrl),
      fetchWithRetry(aqUrl).catch(() => null), // Optional
      fetchWithRetry(floodUrl).catch(() => null), // Optional
      cityName ? Promise.resolve({ city: cityName, state: '' }) : reverseGeocode(lat, lon)
    ]);

    const current = forecastRes.data.current;
    const daily = forecastRes.data.daily;
    const hourly = forecastRes.data.hourly;
    const { condition, description, icon } = mapWeatherCode(current.weather_code);

    // Calculate historical rainfall (past 7 days)
    const pastRainfall = daily.precipitation_sum.slice(0, 7).reduce((a: number, b: number) => a + b, 0);

    let airQuality;
    if (aqRes?.data?.current) {
      const aq = aqRes.data.current;
      airQuality = {
        pm25: aq.pm2_5,
        pm10: aq.pm10,
        pollen: {
          grass: aq.grass_pollen,
          birch: aq.birch_pollen,
          ragweed: aq.ragweed_pollen
        }
      };
    }

    let floodRisk;
    if (floodRes?.data?.daily?.river_discharge) {
      const discharge = floodRes.data.daily.river_discharge[0] || 0;
      floodRisk = {
        discharge,
        status: discharge > 50 ? 'Warning' : 'Safe' as const
      };
    }

    return {
      city: locationInfo.city,
      state: locationInfo.state,
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition,
      description,
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
      icon,
      lat,
      lon,
      daily: {
        time: daily.time,
        tempMax: daily.temperature_2m_max,
        tempMin: daily.temperature_2m_min,
        precipitation: daily.precipitation_sum,
        windSpeed: daily.wind_speed_10m_max,
        weatherCode: daily.weather_code
      },
      airQuality,
      floodRisk,
      historicalRainfall: Math.round(pastRainfall * 10) / 10,
      soilMoisture: {
        time: hourly.time.slice(0, 168), // Past 7 days hourly
        values: hourly.soil_moisture_3_to_9cm.slice(0, 168)
      },
      agriculture: {
        soilTemp: current.soil_temperature_6cm,
        soilMoisture: current.soil_moisture_3_to_9cm
      },
      hourly: {
        time: hourly.time.slice(168, 192), // Next 24 hours
        temp: hourly.temperature_2m.slice(168, 192)
      }
    };
  } catch (error: any) {
    console.error('Open-Meteo API Error:', error);
    throw new Error('Failed to fetch weather data');
  }
};

export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
  console.log(`Geocoding city: ${city}`);
  try {
    const geoUrl = `${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoResponse = await fetchWithRetry(geoUrl);
    
    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      throw new Error('City not found');
    }

    const location = geoResponse.data.results[0];
    return await fetchWeatherByCoords(location.latitude, location.longitude, location.name);
  } catch (error: any) {
    console.error('Open-Meteo Geocoding Error:', error);
    throw new Error(error.message || 'City not found');
  }
};
