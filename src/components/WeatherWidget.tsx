import React, { useState } from 'react';
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  Search, 
  MapPin, 
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWeather } from '../hooks/useWeather';

const WeatherWidget: React.FC = () => {
  const { weather, loading, error, getWeather } = useWeather();

  return (
    <div className="w-full relative z-20">
      {/* Weather Bar */}
      <div className="bg-white border-b border-forest-mint/10 py-8 md:py-10 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-forest-mint/10 flex items-center justify-center text-forest-mint overflow-hidden shrink-0">
              {loading ? (
                <div className="w-full h-full bg-forest-mint/5 animate-pulse flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-forest-mint/30" />
                </div>
              ) : weather?.icon ? (
                <motion.img 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
                  alt={weather.condition}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <CloudSun className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-forest-deep/40 uppercase tracking-widest mb-1">Current Location</p>
              {loading ? (
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-black text-forest-deep/20 flex items-center gap-2 truncate">
                    Detecting...
                    <MapPin className="w-4 h-4 text-forest-mint/20" />
                  </h3>
                  <div className="h-3 w-24 bg-forest-mint/5 animate-pulse rounded" />
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-xl md:text-2xl font-black text-forest-deep flex items-center gap-2 truncate">
                    {weather?.city || 'Detecting Location...'}
                    {weather?.state && <span className="text-forest-mint/60">, {weather.state}</span>}
                    <MapPin className="w-4 h-4 text-forest-mint" />
                  </h3>
                  {weather?.description && (
                    <p className="text-sm font-bold text-forest-mint capitalize truncate">{weather.description}</p>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center gap-8 md:gap-16 flex-wrap md:flex-nowrap">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="w-4 h-4 text-forest-mint" />
                {loading ? (
                  <span className="text-2xl md:text-3xl font-black text-forest-deep/20 leading-none">--°C</span>
                ) : (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl md:text-3xl font-black text-forest-deep leading-none"
                  >
                    {weather?.temp ?? '--'}°C
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] font-bold text-forest-deep/40 uppercase tracking-widest">Temperature</span>
              {!loading && weather?.feelsLike !== undefined && (
                <span className="text-[10px] font-medium text-forest-deep/60 mt-1">Feels like {weather.feelsLike}°C</span>
              )}
            </div>
            <div className="hidden md:block w-px h-10 bg-forest-mint/10"></div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-forest-mint" />
                {loading ? (
                  <span className="text-2xl md:text-3xl font-black text-forest-deep/20 leading-none">--%</span>
                ) : (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl md:text-3xl font-black text-forest-deep leading-none"
                  >
                    {weather?.humidity ?? '--'}%
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] font-bold text-forest-deep/40 uppercase tracking-widest">Humidity</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-forest-mint/10"></div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4 text-forest-mint" />
                {loading ? (
                  <span className="text-2xl md:text-3xl font-black text-forest-deep/20 leading-none">--</span>
                ) : (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl md:text-3xl font-black text-forest-deep leading-none"
                  >
                    {weather?.wind ?? '--'}
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] font-bold text-forest-deep/40 uppercase tracking-widest">Wind km/h</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-3">
              {error && (
                <button 
                  onClick={() => getWeather()}
                  className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-all flex items-center gap-2 group shadow-sm"
                  title={error}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Retry</span>
                </button>
              )}
              <div className="px-6 py-3.5 rounded-2xl bg-forest-mint/5 text-forest-mint font-black text-xs uppercase tracking-widest border border-forest-mint/10 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-forest-mint animate-pulse"></div>
                <span>Auto-Detecting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
