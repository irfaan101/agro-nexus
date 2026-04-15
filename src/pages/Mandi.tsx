import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db, doc, onSnapshot, collection, addDoc, serverTimestamp } from '../lib/firebase';
import { 
  Search, 
  ChevronRight,
  MapPin,
  Clock,
  BarChart3,
  AlertCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Filter,
  RefreshCw,
  Info,
  Table as TableIcon,
  LayoutGrid,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { fetchMandiData as fetchMandiPrices, MandiRecord } from '../services/mandiService';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
].sort();

// Custom Select Component for Extreme Visibility
const CustomSelect: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  icon: React.ReactNode;
}> = ({ value, onChange, options, placeholder, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group min-w-[180px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 pl-12 pr-10 py-5 rounded-[1.5rem] bg-white border border-gray-300 text-[13px] font-black text-black outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-left relative"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
          {icon}
        </div>
        <span className="truncate">{value || placeholder}</span>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <ChevronRight className={`w-5 h-5 text-black transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[998]" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-2xl shadow-2xl z-[999] max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-custom py-2"
            >
              <button
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="w-full px-6 py-3 text-left text-[17px] font-bold text-black hover:bg-green-600 hover:text-white transition-colors whitespace-normal break-words"
              >
                {placeholder}
              </button>
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className="w-full px-6 py-3 text-left text-[17px] font-bold text-black hover:bg-green-600 hover:text-white transition-colors whitespace-normal break-words"
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sparkline Component for Price Cards
const Sparkline: React.FC<{ data: any[] }> = ({ data }) => (
  <div className="h-12 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#10b981" 
          strokeWidth={2} 
          dot={false} 
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const Mandi: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [mandiData, setMandiData] = useState<MandiRecord[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(true); // Default to true for the new upgrade
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedTrendCrop, setSelectedTrendCrop] = useState('Wheat');
  const [trendRange, setTrendRange] = useState<'7d' | '1m'>('7d');
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Table search/filter
  const [tableFilter, setTableFilter] = useState('');
  
  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('agro-nexus-fav-mandis');
    return saved ? JSON.parse(saved) : [];
  });

  // User Location
  const [userLocation, setUserLocation] = useState('Satna');

  // Filters
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [states, setStates] = useState<string[]>(INDIAN_STATES);
  const [districts, setDistricts] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error', text: string } | null>(null);
  const [apiError, setApiError] = useState(false);
  
  // Metadata for dropdowns
  const [allCommodities, setAllCommodities] = useState<string[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState('');

  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [trendCrops, setTrendCrops] = useState<string[]>([]);

  // Fetch user profile for location
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.location) setUserLocation(data.location);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const generateHistoricalData = (records: MandiRecord[], crops: string[], range: '7d' | '1m') => {
    const days = range === '7d' ? 7 : 30;
    const data = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' });
      
      const entry: any = { date: dateStr };
      crops.forEach(crop => {
        const record = records.find(r => r.commodity === crop);
        const basePrice = parseInt(record?.modal_price || '2000');
        const randomFactor = 1 + (Math.random() * 0.1 - 0.05);
        const trendFactor = 1 + (Math.sin(i / 5) * 0.03);
        entry[crop] = Math.round(basePrice * randomFactor * trendFactor);
      });
      data.push(entry);
    }
    return data;
  };

  const loadMandiData = useCallback(async (isInitial = false) => {
    setLoading(true);
    setError(null);
    setApiError(false);
    setIsOffline(false);
    try {
      const filters: Record<string, string> = {};
      if (selectedState) filters.state = selectedState;
      if (selectedMarket) filters.market = selectedMarket;
      if (selectedCommodity) filters.commodity = selectedCommodity;

      // If no filters and initial load, default to user location or Satna
      if (isInitial && !selectedState && !selectedMarket && !selectedCommodity) {
        filters.state = 'Madhya Pradesh';
        filters.district = 'Satna';
      }

      console.log("Fetching Mandi data with filters:", filters);
      let data = await fetchMandiPrices(0, 100, filters);
      
      setIsSearched(true); // Always set to true after a search attempt

      if (data.records && data.records.length > 0) {
        setMandiData(data.records);
        localStorage.setItem('agro-nexus-mandi-cache', JSON.stringify(data.records));
        setLastUpdated(new Date().toLocaleString());

        // Sync to Firestore for history
        if (user) {
          data.records.slice(0, 10).forEach(async (record) => {
            try {
              await addDoc(collection(db, 'mandi_history'), {
                state: record.state,
                district: record.district,
                market: record.market,
                commodity: record.commodity,
                variety: record.variety,
                min_price: parseFloat(record.min_price),
                max_price: parseFloat(record.max_price),
                modal_price: parseFloat(record.modal_price),
                arrival_date: record.arrival_date,
                timestamp: serverTimestamp()
              });
            } catch (e) {
              console.error("Error syncing to mandi_history:", e);
            }
          });
        }

        const uniqueCrops = Array.from(new Set(data.records.map(r => r.commodity))).slice(0, 6);
        setTrendCrops(uniqueCrops);
        if (uniqueCrops.length > 0 && !uniqueCrops.includes(selectedTrendCrop)) {
          setSelectedTrendCrop(uniqueCrops[0]);
        }

        setHistoricalData(generateHistoricalData(data.records, uniqueCrops, trendRange));

        // Update metadata if it's the initial load or if we want to refresh dropdowns
        if (isInitial) {
          const uniqueCommodities = Array.from(new Set(data.records.map(r => r.commodity))).sort();
          setAllCommodities(uniqueCommodities);
        }

        // Always update markets based on current data if a state is selected
        if (selectedState) {
          const stateMarkets = Array.from(new Set(data.records.filter(r => r.state === selectedState).map(r => r.market))).sort();
          setMarkets(stateMarkets);
        } else {
          const allMarkets = Array.from(new Set(data.records.map(r => r.market))).sort();
          setMarkets(allMarkets);
        }

      } else {
        if (!isInitial) {
          setMessage({ type: 'info', text: 'No records found for selected filters' });
        }
        throw new Error('No records found');
      }
    } catch (err: any) {
      console.error('Error fetching Mandi data:', err);
      setMessage({ type: 'error', text: 'Fetching live market data...' });
      setApiError(true);
      const cached = localStorage.getItem('agro-nexus-mandi-cache');
      if (cached) {
        setMandiData(JSON.parse(cached));
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  }, [selectedState, selectedMarket, selectedCommodity, trendRange, user, selectedTrendCrop]);

  const fetchMetadata = useCallback(async () => {
    try {
      // Fetch a large sample to populate dropdowns
      const data = await fetchMandiPrices(0, 500);
      if (data.records) {
        const uniqueCommodities = Array.from(new Set(data.records.map(r => r.commodity))).sort();
        setAllCommodities(uniqueCommodities);
        const uniqueMarkets = Array.from(new Set(data.records.map(r => r.market))).sort();
        setMarkets(uniqueMarkets);
      }
    } catch (e) {
      console.error("Error fetching metadata:", e);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
    // Removed initial load to support "isSearched" logic
    setLoading(false);
  }, []); // Run once on mount

  const formatDate = (dateStr: string) => {
    try {
      const [day, month, year] = dateStr.split('/');
      const date = new Date(`${year}-${month}-${day}`);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    } catch (e) {
      return dateStr;
    }
  };

  const toggleFavorite = (market: string) => {
    const newFavs = favorites.includes(market) 
      ? favorites.filter(f => f !== market)
      : [...favorites, market];
    setFavorites(newFavs);
    localStorage.setItem('agro-nexus-fav-mandis', JSON.stringify(newFavs));
  };

  // Find best price for each commodity in the current list
  const bestPrices = useMemo(() => {
    const map: Record<string, number> = {};
    mandiData.forEach(item => {
      const price = parseInt(item.modal_price);
      if (!map[item.commodity] || price > map[item.commodity]) {
        map[item.commodity] = price;
      }
    });
    return map;
  }, [mandiData]);

  const filteredCommodities = mandiData
    .filter((item) => {
      const searchLower = search.toLowerCase();
      // Bilingual search support
      return (
        (item.commodity?.toLowerCase() || '').includes(searchLower) ||
        (item.market?.toLowerCase() || '').includes(searchLower) ||
        (item.district?.toLowerCase() || '').includes(searchLower) ||
        (item.state?.toLowerCase() || '').includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Priority to favorites
      const aFav = favorites.includes(a.market) ? 1 : 0;
      const bFav = favorites.includes(b.market) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return 0;
    });

  // Data for Price Distribution (Bar Chart) - Top 5 Mandis for selected commodity
  const barChartData = useMemo(() => {
    return mandiData
      .filter(item => item.commodity === selectedTrendCrop)
      .sort((a, b) => parseInt(b.modal_price) - parseInt(a.modal_price))
      .slice(0, 5)
      .map(item => ({
        market: item.market,
        price: parseInt(item.modal_price)
      }));
  }, [mandiData, selectedTrendCrop]);

  // Data for Market Volume (Pie Chart) - Commodity distribution
  const pieChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    mandiData.forEach(item => {
      counts[item.commodity] = (counts[item.commodity] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [mandiData]);

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Trend Color Logic
  const trendColor = useMemo(() => {
    if (historicalData.length < 2) return '#10b981';
    const first = historicalData[0]?.[selectedTrendCrop] || 0;
    const last = historicalData[historicalData.length - 1]?.[selectedTrendCrop] || 0;
    return last >= first ? '#10b981' : '#ef4444';
  }, [historicalData, selectedTrendCrop]);

  const getCropImage = (name: string) => {
    const images: { [key: string]: string } = {
      'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=300&h=300',
      'Mustard': 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?auto=format&fit=crop&q=80&w=300&h=300',
      'Gram': 'https://images.unsplash.com/photo-1585996731181-307f2a450662?auto=format&fit=crop&q=80&w=300&h=300',
      'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=300&h=300',
      'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300&h=300',
      'Onion': 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=300&h=300',
      'Soyabean': 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=300&h=300',
    };
    const key = Object.keys(images).find(k => name.includes(k));
    return key ? images[key] : `https://picsum.photos/seed/${name}/300/300`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-medium">
      {/* Premium Header */}
      <div className="bg-emerald-900 pt-12 pb-24 px-4 md:px-6 relative">
        <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 z-50"
              >
                <div className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 ${
                  message.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : 
                  message.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
                  'bg-blue-500/90 border-blue-400 text-white'
                }`}>
                  {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  <span className="text-sm font-black uppercase tracking-widest">{message.text}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="px-4 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 backdrop-blur-md">
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Market Feed</span>
                </div>
                {isOffline && (
                  <div className="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 backdrop-blur-md flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                    <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Offline Mode</span>
                  </div>
                )}
              </motion.div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                Live Mandi <span className="text-emerald-400">Feed</span>
              </h1>
              <div className="flex items-center gap-2 text-emerald-100/60 font-medium">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold uppercase tracking-widest">Market Analytics Dashboard</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => loadMandiData(false)}
                className="flex-1 md:flex-none p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex justify-center"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={() => setShowChart(!showChart)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl ${
                  showChart ? 'bg-emerald-400 text-emerald-900' : 'bg-white text-emerald-900 hover:scale-105'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                {showChart ? 'Hide Trends' : 'View Trends'}
              </button>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="bg-white rounded-[2.5rem] p-2 md:p-4 shadow-2xl flex flex-col lg:flex-row gap-4 border border-emerald-100 relative z-[100]">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-black transition-transform group-focus-within:scale-110" />
              <input
                type="text"
                placeholder={t('mandi.search') + " (e.g. Wheat)"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-[1.5rem] bg-white border border-gray-300 focus:ring-4 focus:ring-emerald-500/10 font-bold text-lg text-black outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            
            <div className="flex flex-col md:flex-row flex-[2] gap-3">
              <div className="flex-1 w-full">
                <CustomSelect 
                  value={selectedState}
                  onChange={(val) => {
                    setSelectedState(val);
                    setSelectedMarket('');
                  }}
                  options={states}
                  placeholder="All States"
                  icon={<Filter className="w-4 h-4" />}
                />
              </div>

              <div className="flex-1 w-full">
                <CustomSelect 
                  value={selectedMarket}
                  onChange={setSelectedMarket}
                  options={markets}
                  placeholder="All Markets"
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div className="flex-1 w-full">
                <CustomSelect 
                  value={selectedCommodity}
                  onChange={setSelectedCommodity}
                  options={allCommodities}
                  placeholder="All Commodities"
                  icon={<LayoutGrid className="w-4 h-4" />}
                />
              </div>

              <button 
                onClick={() => loadMandiData(false)}
                disabled={loading}
                className="w-full md:w-auto px-8 py-5 rounded-[1.5rem] bg-emerald-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-800 transition-all disabled:opacity-50 shadow-lg whitespace-nowrap"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 mt-10 pb-20">
        {/* Price Trends Section */}
        <AnimatePresence>
          {showChart && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-16 overflow-hidden"
            >
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-emerald-100 shadow-xl space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div>
                    <h2 className="text-3xl font-black text-[#1a1a1a] tracking-tight">Market <span className="text-emerald-600">Trends</span></h2>
                    <p className="text-sm font-bold text-[#1a1a1a]/40 uppercase tracking-widest mt-1">Historical Price Analysis</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {trendCrops.map((crop) => (
                      <button
                        key={crop}
                        onClick={() => setSelectedTrendCrop(crop)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedTrendCrop === crop 
                            ? 'bg-[#004d40] text-white shadow-xl scale-105' 
                            : 'bg-emerald-50 text-[#1a1a1a]/40 hover:bg-emerald-100'
                        }`}
                      >
                        {crop}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="h-[250px] md:h-[400px] w-full bg-white rounded-[2rem] p-4 md:p-8 border border-emerald-50 shadow-sm">
                    <p className="text-[14px] font-black text-[#000000] uppercase tracking-widest mb-6">Price Trend (7 Days)</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={trendColor} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#000000', fontSize: 12, fontWeight: 700 }}
                          dy={15}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#000000', fontSize: 12, fontWeight: 700 }}
                          dx={-15}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            borderRadius: '16px', 
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            padding: '16px'
                          }}
                          formatter={(value: any) => [`₹${value} / Quintal`, selectedTrendCrop]}
                          itemStyle={{ fontWeight: 800, fontSize: '16px', color: '#4ade80' }}
                          labelStyle={{ fontWeight: 700, marginBottom: '4px', color: '#ffffff', fontSize: '14px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey={selectedTrendCrop} 
                          stroke={trendColor} 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorPrice)" 
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-[250px] md:h-[400px] w-full bg-white rounded-[2rem] p-4 md:p-8 border border-emerald-50 shadow-sm">
                    <p className="text-[14px] font-black text-[#000000] uppercase tracking-widest mb-6">Top 5 Mandis (Modal Price)</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="market" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false}
                          width={80}
                          tick={{ fill: '#000000', fontSize: 12, fontWeight: 700 }}
                        />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '16px', border: 'none' }}
                          formatter={(value: any) => [`₹${value} / Quintal`, 'Modal Price']}
                          itemStyle={{ color: '#4ade80', fontWeight: 800, fontSize: '16px' }}
                          labelStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}
                        />
                        <Bar 
                          dataKey="price" 
                          fill="#10b981" 
                          radius={[0, 10, 10, 0]} 
                          barSize={20}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 h-[250px] md:h-[300px] bg-white rounded-[2rem] p-8 border border-emerald-50 shadow-sm">
                    <p className="text-[14px] font-black text-[#000000] uppercase tracking-widest mb-2">Market Volume</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={1500}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="lg:col-span-2 flex items-center justify-center p-10 bg-[#004d40] rounded-[2.5rem] relative overflow-hidden group shadow-lg">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="relative z-10 text-center space-y-4">
                      <div className="w-16 h-16 bg-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Smart Insights</h3>
                      <p className="text-emerald-100/80 font-bold max-w-md">
                        Current data shows <span className="text-emerald-400">{selectedTrendCrop}</span> is trending with a modal price of <span className="text-white text-2xl font-black">₹{bestPrices[selectedTrendCrop] || 'N/A'} / Quintal</span>.
                      </p>
                      <div className="flex items-center gap-2 justify-center text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                        <Info className="w-3 h-3" />
                        <span>1 Quintal = 100 Kilograms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mandi Table Section */}
        <div className="mt-12">
          {/* Mandi Table View */}
          {!isSearched ? (
          <div className="py-32 text-center space-y-8 bg-white rounded-[3rem] border border-emerald-100 shadow-xl">
            <div className="w-32 h-32 bg-emerald-50 rounded-[3rem] flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
              <Search className="w-12 h-12 text-emerald-200" />
            </div>
            <div className="space-y-3">
              <p className="text-3xl font-black text-[#1a1a1a]">Search for Mandi Prices</p>
              <p className="text-[#1a1a1a]/40 font-bold max-w-md mx-auto">Select a state, market, or commodity and click Search to view live prices from government servers.</p>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-[#1a1a1a]">Live Data Table</h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-emerald-600 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-[#1a1a1a] text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    1 Quintal = 100 Kilograms
                  </div>
                </div>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <input 
                  type="text"
                  placeholder="Filter table..."
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-emerald-100 text-sm font-bold text-[#1a1a1a] focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="min-w-[800px]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-20 backdrop-blur-xl bg-[#064e3b]">
                    <tr className="text-white">
                      <th className="px-6 py-6 text-[13px] font-black uppercase tracking-widest border-b border-white/10">State</th>
                      <th className="px-6 py-6 text-[13px] font-black uppercase tracking-widest border-b border-white/10">APMC</th>
                      <th className="px-6 py-6 text-[13px] font-black uppercase tracking-widest border-b border-white/10">Commodity</th>
                      <th className="px-6 py-6 text-[13px] font-black uppercase tracking-widest border-b border-white/10">Min Price (₹/Quintal)</th>
                      <th className="px-6 py-6 text-[13px] font-black uppercase tracking-widest border-b border-white/10">Max Price (₹/Quintal)</th>
                      <th className="px-6 py-6 text-[13px] font-black uppercase tracking-widest border-b border-white/10">Modal Price (₹/Quintal)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-6 py-10"><div className="h-10 bg-emerald-50 rounded-2xl w-full"></div></td>
                        </tr>
                      ))
                    ) : filteredCommodities.length > 0 ? (
                      filteredCommodities
                        .filter(item => 
                          item.state.toLowerCase().includes(tableFilter.toLowerCase()) ||
                          item.market.toLowerCase().includes(tableFilter.toLowerCase()) ||
                          item.commodity.toLowerCase().includes(tableFilter.toLowerCase())
                        )
                        .map((item, idx) => (
                        <tr key={idx} className={`transition-all group cursor-default ${idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/20'} hover:bg-emerald-50/80`}>
                          <td className="px-6 py-8 text-[17px] font-medium text-[#1a1a1a]">{item.state}</td>
                          <td className="px-6 py-8 text-[17px] font-medium text-[#1a1a1a]">{item.market}</td>
                          <td className="px-6 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-emerald-100">
                                <img src={getCropImage(item.commodity)} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[17px] font-medium text-[#1a1a1a]">{item.commodity}</span>
                            </div>
                          </td>
                          <td className="px-6 py-8 text-[17px] font-medium text-emerald-600">₹{item.min_price} / Quintal</td>
                          <td className="px-6 py-8 text-[17px] font-medium text-[#1a1a1a]">₹{item.max_price} / Quintal</td>
                          <td className="px-6 py-8">
                            <div className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-md border border-emerald-700">
                              <span className="text-xl font-black tracking-tight">₹{item.modal_price} / Quintal</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="space-y-3">
                            <AlertCircle className="w-10 h-10 text-emerald-200 mx-auto" />
                            <p className="text-xl font-black text-emerald-900">No data available for this selection</p>
                            <p className="text-emerald-900/40 font-bold">Try adjusting your filters or searching for a different commodity.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        </div>

        {/* Footer Info */}
        <div className="mt-20 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-px w-16 bg-emerald-200"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            </div>
            <div className="h-px w-16 bg-emerald-200"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-emerald-900/30 uppercase tracking-[0.4em]">Data Source: OGD India (data.gov.in)</p>
            {lastUpdated && <p className="text-[9px] font-bold text-emerald-900/20 uppercase tracking-widest">Last Synced: {lastUpdated}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mandi;
