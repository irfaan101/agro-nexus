import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  db, 
  collection, 
  addDoc, 
  Timestamp, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  Scan, 
  BarChart2, 
  CloudSun, 
  Sprout, 
  ArrowRight,
  Search,
  AlertCircle,
  Loader2,
  Bot
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeather } from '../hooks/useWeather';
import WeatherWidget from '../components/WeatherWidget';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { weather } = useWeather();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: searchQuery,
        config: {
          systemInstruction: "You are an expert agricultural assistant. Provide helpful, concise, and accurate information about crops, diseases, farming techniques, and market trends. Keep your response under 200 words.",
        },
      });

      const aiResponse = response.text || "I'm sorry, I couldn't generate a response at this time.";
      setSearchResult(aiResponse);

      // Persist to Firestore if user is logged in
      if (user) {
        try {
          await addDoc(collection(db, 'search_history'), {
            userId: user.uid,
            query: searchQuery,
            response: aiResponse,
            timestamp: Timestamp.now()
          });
        } catch (dbError) {
          console.error("Error saving search history:", dbError);
          // We don't block the UI if history save fails, but we log it
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to get response from AI. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const services = [
    { 
      id: 'scan', 
      title: 'Crop Scanner', 
      description: 'Identify diseases and get instant solutions using AI.',
      icon: Scan, 
      path: '/crop-scan',
      color: 'bg-emerald-500',
      image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600'
    },
    { 
      id: 'mandi', 
      title: 'Mandi Prices', 
      description: 'Real-time market rates from across India.',
      icon: BarChart2, 
      path: '/mandi-prices',
      color: 'bg-blue-500',
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=600'
    },
    { 
      id: 'weather', 
      title: 'Weather Forecast', 
      description: 'Hyper-local weather alerts for your farm.',
      icon: CloudSun, 
      path: '/weather',
      color: 'bg-indigo-500',
      image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=600'
    },
    { 
      id: 'advisory', 
      title: 'Expert Consultation', 
      description: 'Personalized tips from agricultural scientists.',
      icon: Sprout, 
      path: '/expert-advisor',
      color: 'bg-orange-500',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600'
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-forest-light">
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[800px] py-6 md:py-16 flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax-like effect */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920" 
            alt="Healthy Farm" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-forest-deep/40 backdrop-blur-[2px]"></div>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-6xl px-4 md:px-6 text-center space-y-8 md:space-y-12 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-2xl sm:text-5xl md:text-8xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl">
              Your <span className="bg-gradient-to-r from-forest-mint via-emerald-400 to-forest-mint bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                AI Partner
              </span> <br />
              <span className="bg-gradient-to-r from-emerald-400 via-forest-mint to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                for the Future of Farming
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed px-4">
              Agro-Nexus combines AI vision, real-time market data, and hyper-local weather to empower your farm.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="px-6 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-4">
                <div className="flex items-center gap-2 text-white/80">
                  <CloudSun className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-black uppercase tracking-widest">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <div className="text-white/80 text-sm font-black uppercase tracking-widest">
                  {currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Glassmorphism Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-3xl mx-auto"
          >
            <form onSubmit={handleSearch} className="glass-dark p-1.5 md:p-2 rounded-[24px] md:rounded-[32px] shadow-2xl">
              <div className="relative flex flex-col md:flex-row items-center gap-2">
                <div className="absolute left-6 top-6 md:top-1/2 md:-translate-y-1/2 text-white/60 hidden md:block">
                  <Search className="w-6 h-6" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask anything about farming..." 
                  className="w-full pl-6 md:pl-16 pr-6 md:pr-32 py-4 md:py-6 rounded-[18px] md:rounded-[24px] bg-white/10 text-white placeholder:text-white/40 font-bold text-base md:text-lg outline-none focus:bg-white/20 transition-all border border-white/10"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="w-full md:w-auto md:absolute md:right-3 px-8 py-4 bg-forest-mint text-white rounded-[16px] md:rounded-[20px] font-black text-sm uppercase tracking-widest hover:bg-forest-mint/80 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </div>
            </form>

            {/* AI Result Display */}
            <AnimatePresence>
              {(searchResult || isSearching || searchError) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-8 text-left"
                >
                  <div className="bg-[#f9fafb] rounded-[32px] p-8 border border-gray-200 shadow-xl overflow-hidden relative">
                    <div className="flex items-start gap-6 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-forest-mint flex items-center justify-center text-white shrink-0 shadow-lg shadow-forest-mint/20">
                        {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Bot className="w-6 h-6" />}
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-forest-deep font-black uppercase tracking-widest text-[10px]">Agro-Nexus AI</span>
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Assistant</span>
                          </div>
                          {searchResult && <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">Powered by Gemini</span>}
                        </div>
                        
                        {isSearching ? (
                          <div className="space-y-4 py-2">
                            <div className="flex gap-2">
                              <motion.div 
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="h-2 w-2 bg-forest-mint rounded-full"
                              />
                              <motion.div 
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                className="h-2 w-2 bg-forest-mint rounded-full"
                              />
                              <motion.div 
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                className="h-2 w-2 bg-forest-mint rounded-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded-full w-full animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded-full w-2/3 animate-pulse"></div>
                            </div>
                          </div>
                        ) : searchError ? (
                          <div className="flex items-center gap-3 text-red-500 font-bold p-4 bg-red-50 rounded-2xl border border-red-100">
                            <AlertCircle className="w-5 h-5" />
                            {searchError}
                          </div>
                        ) : (
                          <div className="markdown-body">
                            <Markdown>{searchResult}</Markdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quick Stats / Weather Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Link 
              to="/crop-scan" 
              className="w-full md:w-auto group flex items-center justify-center gap-4 px-8 py-5 bg-white text-forest-deep rounded-3xl font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-forest-mint/10 flex items-center justify-center text-forest-mint group-hover:scale-110 transition-transform">
                <Scan className="w-6 h-6" />
              </div>
              Identify My Plant
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1">
            <div className="w-1 h-2 bg-white/40 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Weather Bar (Refined) */}
      <WeatherWidget />

      {/* Service Section */}
      <section className="py-12 md:py-16 px-2 md:px-8 bg-slate-50 pb-24 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-emerald-900 tracking-tight">Our Services</h2>
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs md:text-sm">Everything you need for a better harvest</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(service.path)}
                className="cursor-pointer"
              >
                <div 
                  className="group block bg-white rounded-[40px] overflow-hidden border border-emerald-50 shadow-xl shadow-emerald-100/50 hover:shadow-2xl hover:shadow-emerald-200/50 transition-all hover:scale-105"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                    <div className={`absolute top-6 left-6 w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      <service.icon className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-2xl font-black text-emerald-900 mt-4">{service.title}</h3>
                    <p className="text-emerald-700/70 font-medium leading-relaxed">
                      {service.description}
                    </p>
                    <div className="pt-4 flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                      Explore Service <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
