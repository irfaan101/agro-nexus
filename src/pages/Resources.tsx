import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Globe, 
  FileText, 
  ExternalLink, 
  Sprout, 
  ShieldCheck, 
  TrendingUp,
  Cpu,
  Database,
  Cloud,
  Wrench
} from 'lucide-react';

const Resources: React.FC = () => {
  const resourceCategories = [
    {
      title: "Farming Tools",
      icon: Sprout,
      description: "Essential digital tools for modern precision agriculture.",
      items: [
        { name: "Crop Health Scanner", desc: "AI-powered disease detection", link: "/crop-scan" },
        { name: "Weather Intelligence", desc: "Hyper-local farm forecasts", link: "/weather" },
        { name: "Irrigation Planner", desc: "Soil moisture based scheduling", link: "#" }
      ]
    },
    {
      title: "Govt Schemes",
      icon: ShieldCheck,
      description: "Latest Indian government initiatives for farmer welfare.",
      items: [
        { name: "PM-KISAN", desc: "Direct income support for farmers", link: "https://pmkisan.gov.in/" },
        { name: "PM Fasal Bima Yojana", desc: "Crop insurance for risk mitigation", link: "https://pmfby.gov.in/" },
        { name: "e-NAM", desc: "National Agriculture Market portal", link: "https://www.enam.gov.in/" }
      ]
    },
    {
      title: "Market APIs",
      icon: TrendingUp,
      description: "Developer resources for agricultural data integration.",
      items: [
        { name: "Open-Meteo API", desc: "Free weather & soil data", link: "https://open-meteo.com/" },
        { name: "Data.gov.in", desc: "Indian government open data", link: "https://data.gov.in/" },
        { name: "Agro-Nexus SDK", desc: "Custom AI model integration", link: "#" }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8fafc] pb-20 font-sans"
    >
      {/* Hero Header */}
      <div className="bg-[#004d40] pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-400/10 border border-emerald-400/30 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-md">
              Knowledge Hub
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
              Agro-Nexus <span className="text-emerald-400">Resources</span>
            </h1>
            <p className="text-white/60 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Empowering Indian farmers with the right information, tools, and government support at their fingertips.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resourceCategories.map((category, idx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white/70 backdrop-blur-xl border border-emerald-100 rounded-[2.5rem] p-8 shadow-xl shadow-emerald-900/5 flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                <category.icon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-[#004d40] mb-3">{category.title}</h2>
              <p className="text-emerald-900/50 font-medium text-sm mb-8 leading-relaxed">
                {category.description}
              </p>
              
              <div className="space-y-4 mt-auto">
                {category.items.map((item) => (
                  <a 
                    key={item.name}
                    href={item.link}
                    target={item.link.startsWith('http') ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                  >
                    <div>
                      <p className="text-sm font-black text-[#004d40]">{item.name}</p>
                      <p className="text-[10px] font-bold text-emerald-900/40 uppercase tracking-wider">{item.desc}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-300 group-hover:text-emerald-600 transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack Section (Subtle) */}
        <div className="mt-20 text-center">
          <h2 className="text-xs font-black text-emerald-900/30 uppercase tracking-[0.3em] mb-12">Powered By Industry Standards</h2>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              <span className="font-black text-sm">Gemini AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <span className="font-black text-sm">Google Cloud</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              <span className="font-black text-sm">Open-Meteo</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Resources;
