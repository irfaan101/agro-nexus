import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherByCoords, fetchWeatherByCity, WeatherData } from '../services/weatherService';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default coordinates for Satna, MP (24.57, 80.83)
  const DEFAULT_LAT = 24.57;
  const DEFAULT_LON = 80.83;
  const DEFAULT_CITY = 'Satna, MP';

  const getWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    console.log('Weather: Starting automated fetch process...');

    try {
      let data: WeatherData;
      
      // Try geolocation with a strict 5-second timeout
      if ("geolocation" in navigator) {
        console.log('Weather: Requesting geolocation permission...');
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { 
              timeout: 5000, 
              enableHighAccuracy: true,
              maximumAge: 30000
            });
          });
          console.log('Weather: Geolocation successful.');
          data = await fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
        } catch (geoErr: any) {
          console.warn('Weather: Geolocation failed. Falling back to Satna.', geoErr);
          data = await fetchWeatherByCoords(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
        }
      } else {
        console.warn('Weather: Geolocation not supported. Falling back to Satna.');
        data = await fetchWeatherByCoords(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
      }
      
      setWeather(data);
      console.log('Weather: Data load complete for', data.city);
    } catch (err: any) {
      console.error('Weather: Unexpected error:', err.message);
      setError(err.message || 'Failed to load weather data');
      
      // Final fallback
      try {
        const fallbackData = await fetchWeatherByCoords(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
        setWeather(fallbackData);
        setError(null); 
      } catch (finalErr) {
        console.error('Weather: CRITICAL - Final fallback failed:', finalErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getWeather();
    
    // Auto-refresh every 30 minutes
    const REFRESH_INTERVAL = 30 * 60 * 1000;
    const interval = setInterval(getWeather, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [getWeather]);

  return { weather, loading, error, getWeather };
};
