import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Thermometer, 
  History, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  Waves,
  Activity,
  CheckCircle2,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { useWeather } from '../hooks/useWeather';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const Weather: React.FC = () => {
  const { weather, loading, error } = useWeather();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const hourlyData = weather?.hourly ? weather.hourly.time.map((time, i) => ({
    time: new Date(time).toLocaleTimeString('en-US', { hour: 'numeric' }),
    temp: Math.round(weather.hourly!.temp[i]),
  })) : [];

  const dailyForecast = weather?.daily ? weather.daily.time.map((time, i) => ({
    day: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
    max: Math.round(weather.daily!.tempMax[i]),
    min: Math.round(weather.daily!.tempMin[i]),
    code: weather.daily!.weatherCode[i],
  })) : [];

  const getConditionIcon = (code: number) => {
    if (code === 0) return <CloudSun className="w-6 h-6 text-amber-400" />;
    if (code <= 3) return <CloudSun className="w-6 h-6 text-slate-400" />;
    if (code >= 51 && code <= 67) return <Droplets className="w-6 h-6 text-blue-400" />;
    if (code >= 71 && code <= 86) return <History className="w-6 h-6 text-slate-300" />;
    if (code >= 95) return <AlertTriangle className="w-6 h-6 text-amber-600" />;
    return <CloudSun className="w-6 h-6 text-amber-400" />;
  };

  if (loading && !weather) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-20">
        <div className="bg-emerald-900 pt-32 pb-24 px-6 relative overflow-hidden animate-pulse">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="h-4 w-32 bg-white/10 rounded-full mb-4" />
            <div className="h-12 w-64 bg-white/20 rounded-xl mb-4" />
            <div className="h-4 w-96 bg-white/10 rounded-full" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 -mt-12 space-y-8">
          <div className="h-32 w-full bg-white rounded-[2.5rem] shadow-xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[400px] bg-white rounded-[2.5rem] shadow-xl animate-pulse" />
            <div className="space-y-8">
              <div className="h-48 bg-white rounded-[2.5rem] shadow-xl animate-pulse" />
              <div className="h-48 bg-white rounded-[2.5rem] shadow-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-slate-900">
      {/* Original Green Header */}
      <div className="bg-emerald-900 pt-32 pb-24 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="px-4 py-1.5 rounded-xl bg-emerald-400/10 border border-emerald-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.3)] flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
            <span className="text-emerald-400 text-sm font-black font-mono tracking-widest">
              {formatTime(currentTime)}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-2 leading-tight">
                  Weather <span className="text-emerald-400">Intelligence</span>
          </h1>
          <p className="text-white/60 font-medium max-w-xl">
            Hyper-local Environmental Monitoring for an Advanced Weather Intelligence across India.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 md:px-6 -mt-12 space-y-8">
        {/* Original White Information Card */}
        <WeatherWidget />

        {/* 7-Day Forecast (Horizontal Google Style) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-100">
          <h2 className="text-xl font-black text-emerald-900 mb-8 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            7-Day Forecast
          </h2>
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide -mx-2 px-2">
            {dailyForecast.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-emerald-50 transition-colors min-w-[110px] flex-shrink-0 border border-transparent hover:border-emerald-100">
                <span className="text-xs font-black text-emerald-900/40 uppercase tracking-widest">{i === 0 ? 'Today' : day.day}</span>
                <div className="p-3 rounded-2xl bg-slate-50">
                  {getConditionIcon(day.code)}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-emerald-900">{day.max}°</span>
                  <span className="text-lg font-black text-emerald-900/30">/</span>
                  <span className="text-lg font-black text-emerald-900/30">{day.min}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Charts & Trends */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hourly Trend Graph */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-emerald-900">Temperature Trend</h3>
                    <p className="text-emerald-900/40 text-xs font-bold">Hourly Forecast Analysis</p>
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                      interval={3}
                    />
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorTemp)" 
                      name="Temp (°C)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Agriculture Intelligence (Live Data) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Thermometer className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-emerald-900">Soil Temperature</h3>
                    <p className="text-emerald-900/40 text-xs font-bold">Live at 6cm Depth</p>
                  </div>
                </div>
                <div className="text-5xl font-black text-emerald-900">
                  {weather?.agriculture?.soilTemp || '--'}<span className="text-2xl ml-1">°C</span>
                </div>
                <p className="mt-4 text-sm font-medium text-emerald-900/50 leading-relaxed">
                  Measured live from Open-Meteo. Optimal for root development.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-emerald-900">Soil Moisture</h3>
                    <p className="text-emerald-900/40 text-xs font-bold">3-9cm Root Zone</p>
                  </div>
                </div>
                <div className="text-5xl font-black text-blue-600">
                  {weather?.agriculture?.soilMoisture || '--'}<span className="text-2xl ml-1 text-blue-600/40">m³/m³</span>
                </div>
                <p className="mt-4 text-sm font-medium text-emerald-900/50 leading-relaxed">
                  Live volumetric water content for precision irrigation.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Environmental Intelligence */}
          <div className="space-y-8">
            {/* Air Quality Module */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-900">Air Quality</h3>
                  <p className="text-emerald-900/40 text-xs font-bold">Atmospheric Health</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PM2.5</div>
                  <div className="text-xl font-black text-emerald-900">{weather?.airQuality?.pm25 || '--'}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PM10</div>
                  <div className="text-xl font-black text-emerald-900">{weather?.airQuality?.pm10 || '--'}</div>
                </div>
              </div>
            </div>

            {/* Flood Risk Module */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-500">
                  <Waves className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-900">Flood Risk</h3>
                  <p className="text-emerald-900/40 text-xs font-bold">River Discharge</p>
                </div>
              </div>
              <div className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 border-dashed transition-colors ${weather?.floodRisk?.status === 'Safe' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`}>
                {weather?.floodRisk?.status === 'Safe' ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-red-500 mb-2 animate-bounce" />
                )}
                <span className={`text-xl font-black uppercase tracking-[0.2em] ${weather?.floodRisk?.status === 'Safe' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {weather?.floodRisk?.status || 'SAFE'}
                </span>
              </div>
            </div>

            {/* Rainfall History */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-900">Rainfall (7d)</h3>
                  <p className="text-emerald-900/40 text-xs font-bold">Accumulation</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-900 mb-1">
                  {weather?.historicalRainfall || 0} <span className="text-lg text-emerald-900/40">mm</span>
                </div>
                <p className="text-xs font-bold text-emerald-600">Total accumulated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
