import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db, doc, onSnapshot } from '../lib/firebase';
import { 
  User, 
  Home, 
  Scan, 
  BarChart2, 
  LayoutDashboard, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  Search,
  Languages,
  TrendingUp,
  CloudSun,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Footer from './Footer';
import BottomNav from './BottomNav';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (!desktop) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      setProfilePhoto(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setProfilePhoto(doc.data().photoURL || null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const initTranslate = () => {
      // @ts-ignore
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        const desktopEl = document.getElementById('google_translate_element');

        if (desktopEl && !desktopEl.innerHTML) {
          // @ts-ignore
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'hi,ur,bn,ta,te,mr,gu,pa,ml,kn,as,or,sd,ks,ne,kok,mai,doi,sat,mni,brx',
            // @ts-ignore
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element');
        }
      } else {
        setTimeout(initTranslate, 500);
      }
    };

    // @ts-ignore
    window.googleTranslateElementInit = initTranslate;

    // Load script if not already present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      initTranslate();
    }
  }, []);

  const sidebarItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Mandi Prices', path: '/mandi-prices', icon: BarChart2 },
    { name: 'Crop Scan', path: '/crop-scan', icon: Scan },
    { name: 'Weather', path: '/weather', icon: CloudSun },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Expert Consultation', path: '/expert-advisor', icon: Bot },
    { name: 'Help & Support', path: '/support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-forest-light font-sans text-forest-deep flex flex-col">
      {/* Mobile Header - Clean */}
      <header className="md:hidden flex sticky top-0 z-50 bg-[#ECFDF5] border-b border-emerald-100 px-4 py-3 justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-emerald-900 hover:bg-emerald-600/5 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/profile" className="flex items-center gap-3 hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/20 overflow-hidden border border-white/20">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.email?.[0].toUpperCase()
                )}
              </div>
            </Link>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Desktop Header - Clean & Push Mode */}
      <header 
        className="hidden md:flex sticky top-0 z-50 bg-[#ECFDF5] border-b border-emerald-100 px-8 py-4 justify-end items-center transition-all duration-300 ease-in-out shadow-sm"
        style={{ marginLeft: isDesktop ? (isOpen ? '260px' : '70px') : '0' }}
      >
        <div className="flex items-center gap-2 mr-8">
          {sidebarItems.slice(0, 3).map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`text-[17px] font-bold px-4 py-2 rounded-xl transition-all relative ${location.pathname === item.path ? 'text-emerald-600 bg-emerald-600/10' : 'text-emerald-900 hover:text-emerald-600 hover:bg-emerald-600/5'}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/profile" className="flex items-center gap-3 hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/20 overflow-hidden border border-white/20">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.email?.[0].toUpperCase()
                )}
              </div>
            </Link>
          ) : (
            <Link to="/login" className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all">
              Login
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay (Backdrop) */}
        <AnimatePresence>
          {!isDesktop && isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
            />
          )}
        </AnimatePresence>

        {/* Unified Sidebar */}
        <aside 
          className={`
            fixed top-0 left-0 bottom-0 z-[90] bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300 ease-in-out flex flex-col
            ${isDesktop 
              ? (isOpen ? 'w-[260px]' : 'w-[70px]') 
              : (isOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full')
            }
          `}
        >
          {/* Sidebar Header - Unified Row when Open, Stacked when Closed */}
          <div className={`flex border-b border-slate-200 transition-all duration-300 ${isOpen ? 'h-[81px] px-4 items-center gap-2' : 'h-[140px] flex-col items-center justify-center gap-4'}`}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[#000000] hover:bg-forest-mint/5 rounded-xl transition-colors shrink-0"
              title={isOpen ? "Collapse Menu" : "Expand Menu"}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <Link to="/" className="flex items-center gap-3 overflow-hidden">
              <span className="text-2xl w-10 h-10 flex items-center justify-center shrink-0" title="Agro-Nexus">🌱</span>
              <span className={`text-xl font-black tracking-tight text-forest-deep whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Agro-Nexus
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => !isDesktop && setIsOpen(false)}
                  className={`flex items-center ${!isOpen ? 'justify-center' : 'gap-4 px-4'} py-3.5 rounded-2xl transition-all group relative ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                      : 'text-forest-deep/70 hover:bg-forest-mint/5 hover:text-forest-mint'
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-800 group-hover:scale-110 transition-transform'}`} />
                  {isOpen ? (
                    <span className="font-bold text-sm whitespace-nowrap">{item.name}</span>
                  ) : (
                    /* Tooltip for Closed Mode */
                    <div className="absolute left-full ml-4 px-3 py-2 bg-forest-deep text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                      {item.name}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-forest-deep"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main 
          className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-24 md:pb-0 transition-all duration-300 ease-in-out px-4 md:px-0"
          style={{ marginLeft: isDesktop ? (isOpen ? '260px' : '70px') : '0' }}
        >
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-0">
            {children}
          </div>
          <Footer />
        </main>
      </div>

      {/* Sticky Bottom Navigation for Mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
