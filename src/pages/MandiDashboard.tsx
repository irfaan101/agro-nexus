import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MapPin, 
  Calendar,
  Filter,
  RefreshCw,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchMandiData, MandiRecord, getPriceTrend } from '../services/mandiService';

const MandiDashboard: React.FC = () => {
  const [data, setData] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<MandiRecord | null>(null);
  const [trendData, setTrendData] = useState<{ day: string; price: number }[]>([]);

  const loadData = async () => {
    setLoading(true);
    const response = await fetchMandiData();
    const records = response.records;
    setData(records);
    if (records.length > 0) {
      setSelectedCommodity(records[0]);
      setTrendData(getPriceTrend(parseInt(records[0].modal_price)));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (item.commodity?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.market?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.district?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleSelectCommodity = (item: MandiRecord) => {
    setSelectedCommodity(item);
    setTrendData(getPriceTrend(parseInt(item.modal_price)));
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { highest: 0, average: 0, trend: 0 };
    
    const prices = filteredData.map(d => parseInt(d.modal_price));
    const highest = Math.max(...prices);
    const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    // Mock trend percentage
    const trend = (Math.random() * 10 - 5).toFixed(1);
    
    return { highest, average, trend: parseFloat(trend) };
  }, [filteredData]);

  // Shimmer Skeleton
  const Skeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-forest-deep/5 rounded-3xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 bg-forest-deep/5 rounded-2xl"></div>
        <div className="h-24 bg-forest-deep/5 rounded-2xl"></div>
        <div className="h-24 bg-forest-deep/5 rounded-2xl"></div>
      </div>
      <div className="h-64 bg-forest-deep/5 rounded-3xl"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-forest-light p-4 md:p-8 space-y-8 font-sans pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Market Intelligence</h1>
          <p className="text-sm md:text-base text-slate-600 font-medium">Real-time Mandi price monitoring & analytics</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-deep/40 group-focus-within:text-forest-mint transition-colors" />
            <input 
              type="text" 
              placeholder="Search crops or markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-forest-deep/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-forest-mint/20 focus:border-forest-mint transition-all w-full md:w-80 font-medium text-forest-deep"
            />
          </div>
          <button 
            onClick={loadData}
            className="p-3 bg-white border border-forest-deep/10 rounded-2xl text-forest-deep hover:bg-forest-mint/5 hover:text-forest-mint transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton />
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-[32px] border border-forest-deep/5 shadow-sm flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-forest-mint/10 rounded-2xl flex items-center justify-center text-forest-mint">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Highest Price Today</p>
                <p className="text-2xl font-black text-slate-900">₹{stats.highest}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-[32px] border border-forest-deep/5 shadow-sm flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Market Price</p>
                <p className="text-2xl font-black text-slate-900">₹{stats.average}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-[32px] border border-forest-deep/5 shadow-sm flex items-center gap-5"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stats.trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stats.trend >= 0 ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Trend %</p>
                <p className={`text-2xl font-black ${stats.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.trend > 0 ? '+' : ''}{stats.trend}%
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-forest-deep/5 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Price Trend Analysis</h2>
                  <p className="text-sm font-medium text-slate-500">7-day fluctuation for {selectedCommodity?.commodity}</p>
                </div>
                <div className="px-4 py-2 bg-forest-light rounded-xl text-xs font-bold text-forest-mint border border-forest-mint/10">
                  Live Feed
                </div>
              </div>

              <div className="h-[300px] md:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#40916C" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#40916C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ fontWeight: 800, color: '#1B4332' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#40916C" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market</p>
                  <p className="text-sm font-bold text-slate-900">{selectedCommodity?.market}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variety</p>
                  <p className="text-sm font-bold text-slate-900">{selectedCommodity?.variety}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Price</p>
                  <p className="text-sm font-bold text-slate-900">₹{selectedCommodity?.min_price}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Price</p>
                  <p className="text-sm font-bold text-slate-900">₹{selectedCommodity?.max_price}</p>
                </div>
              </div>
            </motion.div>

            {/* List Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] border border-forest-deep/5 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Market Feed</h3>
                <Filter className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 overflow-y-auto max-h-[550px] custom-scrollbar">
                {filteredData.length > 0 ? filteredData.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectCommodity(item)}
                    className={`w-full p-6 text-left border-b border-forest-deep/5 transition-all flex items-center justify-between group ${selectedCommodity === item ? 'bg-forest-mint/5' : 'hover:bg-forest-light'}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{item.commodity}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">{item.variety}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {item.market}, {item.district}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-black text-slate-900">₹{item.modal_price}</p>
                      <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                        <TrendingUp className="w-2 h-2" />
                        +2.4%
                      </p>
                    </div>
                  </button>
                )) : (
                  <div className="p-12 text-center space-y-4">
                    <Info className="w-12 h-12 text-forest-deep/10 mx-auto" />
                    <p className="text-forest-deep/40 font-bold">No matching records</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default MandiDashboard;
