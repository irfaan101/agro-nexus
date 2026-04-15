import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Scan, BarChart2, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Scan', path: '/crop-scan', icon: Scan },
    { name: 'Mandi', path: '/mandi-prices', icon: BarChart2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white border-t border-emerald-100 px-6 h-16 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 transition-all active:scale-90 ${
              isActive ? 'text-emerald-800' : 'text-emerald-400'
            }`}
          >
            <item.icon className={`w-6 h-6 ${isActive ? 'fill-emerald-800/10' : ''}`} />
            <span className={`text-[11px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
