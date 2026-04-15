import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Linkedin, 
  Instagram, 
  Github, 
  Languages,
  Heart,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Developer {
  id: string;
  name: string;
  linkedin: string;
  instagram: string;
  github: string;
}

const developers: Developer[] = [
  {
    id: 'harshit',
    name: 'Harshit Vishwakarma',
    linkedin: 'https://www.linkedin.com/in/harshit-vishwakarma-5948b833b/',
    instagram: 'https://www.instagram.com/itx__prince__001?igsh=MWkzdzloemN5am9qaw',
    github: 'https://github.com/'
  },
  {
    id: 'irfaan',
    name: 'Irfaan Mansoori',
    linkedin: 'https://www.linkedin.com/in/irfaan-sta/',
    instagram: 'https://www.instagram.com/irfaan_mansoori_100?igsh=MXR5bzB0NzZzcGlhag',
    github: 'https://github.com/irfaan101'
  },
  {
    id: 'jeet',
    name: 'Jeet Lakhera',
    linkedin: 'https://www.linkedin.com/in/jeet-lakhera-6685a133a',
    instagram: 'https://www.instagram.com/krishna__10001?igsh=eDE4eGY2N2Z6OHRy',
    github: 'https://github.com/Jeet877'
  }
];

const Footer: React.FC = () => {
  const [activeDev, setActiveDev] = useState<string | null>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (footerRef.current && !footerRef.current.contains(event.target as Node)) {
        setActiveDev(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <footer ref={footerRef} className="bg-emerald-950 text-white pt-40 pb-8 px-6 md:px-12 relative overflow-visible">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Branding */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">Agro-Nexus</span>
          </Link>
          <p className="text-gray-300 font-medium leading-relaxed max-w-xs">
            Empowering Indian farmers with real-time AI insights for a sustainable and prosperous future.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold text-white">Quick Links</h4>
          <ul className="flex flex-col gap-4">
            <li>
              <Link to="/" className="text-gray-300 hover:text-white transition-colors font-medium">Home</Link>
            </li>
            <li>
              <Link to="/scan" className="text-gray-300 hover:text-white transition-colors font-medium">Crop Scanner</Link>
            </li>
            <li>
              <Link to="/mandi" className="text-gray-300 hover:text-white transition-colors font-medium">Mandi Prices</Link>
            </li>
            <li>
              <Link to="/history" className="text-gray-300 hover:text-white transition-colors font-medium">My History</Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold text-white">Resources</h4>
          <ul className="flex flex-col gap-4">
            <li>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors font-medium">About Agro-Nexus</Link>
            </li>
            <li>
              <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors font-medium">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms" className="text-gray-300 hover:text-white transition-colors font-medium">Terms of Service</Link>
            </li>
            <li>
              <Link to="/support" className="text-gray-300 hover:text-white transition-colors font-medium">Contact Support</Link>
            </li>
          </ul>
        </div>

        {/* Language Selector */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold text-white">Language</h4>
          <p className="text-gray-400 text-sm font-medium">
            Select your preferred language for the application.
          </p>
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
            <Languages className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div id="google_translate_element" className="google-translate-container flex-1"></div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Heart Message */}
          <div className="flex items-center gap-2 text-gray-300 font-bold">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>for Indian Farmers</span>
          </div>
          
          {/* Team Signature with Click-to-Reveal */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2">
            <span className="text-gray-400 text-sm font-medium">Developed by:</span>
            {developers.map((dev, index) => (
              <React.Fragment key={dev.id}>
                <div className="relative inline-block group/dev">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDev(activeDev === dev.id ? null : dev.id);
                    }}
                    className="relative text-white text-base md:text-lg font-semibold cursor-pointer transition-all duration-300 hover:text-emerald-400 hover:scale-105 inline-block"
                  >
                    {dev.name}
                    {/* Sliding Underline */}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-emerald-400 transition-all duration-300 group-hover/dev:w-full" />
                  </span>
                  
                  <AnimatePresence>
                    {activeDev === dev.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: -8, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-52 bg-emerald-900 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          <a 
                            href={dev.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm font-bold text-gray-200 hover:text-white group/link"
                          >
                            <Linkedin className="w-4 h-4 text-emerald-400 transition-colors group-hover/link:text-[#0077B5] group-hover/link:scale-110" />
                            LinkedIn
                          </a>
                          <a 
                            href={dev.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm font-bold text-gray-200 hover:text-white group/link"
                          >
                            <Instagram className="w-4 h-4 text-emerald-400 transition-colors group-hover/link:text-[#E4405F] group-hover/link:scale-110" />
                            Instagram
                          </a>
                          <a 
                            href={dev.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm font-bold text-gray-200 hover:text-white group/link"
                          >
                            <Github className="w-4 h-4 text-emerald-400 transition-colors group-hover/link:text-white group-hover/link:scale-110" />
                            GitHub
                          </a>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-emerald-900" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {index < developers.length - 1 && <span className="text-gray-500 text-sm font-medium">,</span>}
                {index === developers.length - 2 && <span className="text-gray-500 text-sm font-medium ml-1">and</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-gray-500 text-xs font-medium tracking-wide">
            © 2026 Agro-Nexus. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
