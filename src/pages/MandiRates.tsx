import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  ChevronRight,
  Info,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchMandiAnalytics, MandiRecord } from '../services/mandiAnalyticsService';

const MandiRates: React.FC = () => {
  const [data, setData] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch data with optional filters
  const loadMandiRates = async (commodity?: string, market?: string) => {
    setLoading(true);
    setError(null);
    try {
      const records = await fetchMandiAnalytics({ commodity, market });
      setData(records);
    } catch (err: any) {
      console.error('MandiRates Error:', err);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMandiRates();
  }, []);

  // Handle search with basic heuristics for commodity vs market
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadMandiRates();
      return;
    }

    // Heuristic: if search is 'Satna' or 'Bhopal', treat as market. Otherwise, treat as commodity.
    const lowerSearch = searchTerm.toLowerCase();
    if (lowerSearch.includes('satna') || lowerSearch.includes('bhopal')) {
      loadMandiRates(undefined, searchTerm);
    } else {
      loadMandiRates(searchTerm, undefined);
    }
  };

  // Shimmer Skeleton Loader
  const ShimmerLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-[32px] p-6 border border-forest-deep/5 space-y-4 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-forest-light rounded-2xl"></div>
            <div className="w-20 h-6 bg-forest-light rounded-lg"></div>
          </div>
          <div className="space-y-2">
            <div className="w-3/4 h-6 bg-forest-light rounded-lg"></div>
            <div className="w-1/2 h-4 bg-forest-light rounded-lg"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-forest-deep/5">
            <div className="h-10 bg-forest-light rounded-xl"></div>
            <div className="h-10 bg-forest-light rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-forest-light p-6 md:p-12 space-y-12">
      {/* Header & Search */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-forest-mint">
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Agro-Nexus Analytics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-forest-deep tracking-tight">Mandi Analytics</h1>
          <p className="text-forest-deep/60 font-medium max-w-xl">
            Real-time market rates from OGD India. Search for commodities like <span className="text-forest-mint font-bold">Wheat</span> or markets like <span className="text-forest-mint font-bold">Satna</span>.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative group w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-deep/30 group-focus-within:text-forest-mint transition-colors" />
          <input 
            type="text" 
            placeholder="Search crop or market..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-forest-deep/10 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-forest-mint/10 focus:border-forest-mint transition-all font-bold text-forest-deep shadow-xl shadow-forest-deep/5"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-forest-deep text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-forest-mint transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <ShimmerLoader />
        ) : (
          <AnimatePresence mode="wait">
            {data.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {data.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-[40px] p-8 border border-forest-deep/5 shadow-xl shadow-forest-deep/5 hover:shadow-2xl hover:shadow-forest-deep/10 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-forest-mint/10 rounded-2xl flex items-center justify-center text-forest-mint group-hover:bg-forest-mint group-hover:text-white transition-colors">
                        <TrendingUp className="w-7 h-7" />
                      </div>
                      <div className="px-4 py-1.5 bg-forest-light rounded-full text-[10px] font-black text-forest-mint uppercase tracking-widest border border-forest-mint/10">
                        {item.variety}
                      </div>
                    </div>

                    <div className="space-y-1 mb-8">
                      <h3 className="text-2xl font-black text-forest-deep leading-tight">{item.commodity}</h3>
                      <div className="flex items-center gap-2 text-forest-deep/40 font-bold text-sm">
                        <MapPin className="w-4 h-4" />
                        {item.market}, {item.district}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-forest-light rounded-2xl border border-forest-mint/5">
                        <p className="text-[10px] font-black text-forest-deep/30 uppercase tracking-widest mb-1">Min Price</p>
                        <p className="text-xl font-black text-forest-deep">₹{item.min_price}</p>
                      </div>
                      <div className="p-4 bg-forest-mint/5 rounded-2xl border border-forest-mint/10">
                        <p className="text-[10px] font-black text-forest-mint uppercase tracking-widest mb-1">Max Price</p>
                        <p className="text-xl font-black text-forest-deep">₹{item.max_price}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-forest-deep/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-forest-deep/40">
                        <Info className="w-3 h-3" />
                        Updated: {item.arrival_date}
                      </div>
                      <ChevronRight className="w-5 h-5 text-forest-mint opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 space-y-6"
              >
                <div className="w-24 h-24 bg-forest-deep/5 rounded-full flex items-center justify-center mx-auto text-forest-deep/20">
                  <AlertCircle className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-forest-deep">No results found</h3>
                  <p className="text-forest-deep/40 font-medium">Try searching for a different crop or market.</p>
                </div>
                <button 
                  onClick={() => { setSearchTerm(''); loadMandiRates(); }}
                  className="px-8 py-3 bg-forest-deep text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-forest-mint transition-colors"
                >
                  Clear Search
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Error Fallback (Subtle) */}
      {error && !loading && (
        <div className="fixed bottom-8 right-8 max-w-sm bg-red-50 border border-red-100 p-6 rounded-[24px] shadow-2xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="font-black text-red-900 text-sm">Connection Issue</p>
            <p className="text-red-700/60 text-xs font-medium leading-relaxed">{error}</p>
            <button 
              onClick={() => loadMandiRates()}
              className="mt-2 text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2 hover:text-red-800"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MandiRates;
