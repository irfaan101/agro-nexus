import React from 'react';
import { motion } from 'motion/react';
import { Scan, BarChart2, CloudSun, ShieldCheck, Zap, Users } from 'lucide-react';

const About: React.FC = () => {
  const techStack = [
    { name: "React 18", icon: Zap, desc: "Ultra-fast UI rendering" },
    { name: "Google Cloud", icon: CloudSun, desc: "Scalable global infrastructure" },
    { name: "Gemini AI", icon: Scan, desc: "Advanced agricultural vision" },
    { name: "Firebase", icon: ShieldCheck, desc: "Secure real-time data" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8fafc] pb-20 font-sans"
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-[#004d40]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-400/10 border border-emerald-400/30 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest mb-8 backdrop-blur-md">
              Our Journey
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
              Empowering the Hands that <span className="text-emerald-400">Feed India.</span>
            </h1>
            <p className="text-xl text-white/70 font-medium leading-relaxed max-w-2xl mx-auto">
              Agro-Nexus isn't just an app; it's a movement to bridge the gap between ancient wisdom and future intelligence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Inspiring Story Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-[#004d40] leading-tight">
                From the Soil to the <span className="text-emerald-500">Cloud.</span>
              </h2>
              <div className="w-20 h-1.5 bg-emerald-500 rounded-full"></div>
            </div>
            
            <div className="space-y-6 text-emerald-900/70 text-lg font-medium leading-relaxed">
              <p>
                In the heart of India's agricultural belt, we saw a challenge: brilliant farmers working with limited data. We envisioned a world where every farmer has a scientist in their pocket.
              </p>
              <p>
                Agro-Nexus was born from the belief that **AI and Data Science** should serve those who need it most. By combining satellite imagery, real-time market trends, and advanced computer vision, we're giving farmers the "Digital Sight" to see diseases before they spread and market shifts before they happen.
              </p>
              <p>
                Our mission is simple: To ensure that every harvest is a success, and every farmer is a CEO of their own land.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-900/20 border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800" 
                alt="Farmer with Tablet" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Glass Badge */}
            <div className="absolute -bottom-10 -left-10 bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-emerald-100 shadow-2xl max-w-xs">
              <div className="text-4xl font-black text-emerald-600 mb-1">98%</div>
              <p className="text-sm font-bold text-[#004d40] uppercase tracking-widest">AI Detection Accuracy</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 bg-emerald-50/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.3em]">The Engine Behind the Vision</h2>
            <h3 className="text-4xl font-black text-[#004d40]">Our Modern Tech Stack</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {techStack.map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl shadow-emerald-900/5 text-center group hover:-translate-y-2 transition-all"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <tech.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-[#004d40] mb-2">{tech.name}</h4>
                <p className="text-emerald-900/40 text-xs font-bold uppercase tracking-widest">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <h2 className="text-4xl font-black text-[#004d40]">Built on Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="text-emerald-500 font-black text-6xl opacity-20">01</div>
              <h3 className="text-xl font-black text-[#004d40]">Farmer First</h3>
              <p className="text-emerald-900/50 font-medium">Every feature we build starts with a conversation in the field.</p>
            </div>
            <div className="space-y-4">
              <div className="text-emerald-500 font-black text-6xl opacity-20">02</div>
              <h3 className="text-xl font-black text-[#004d40]">Radical Transparency</h3>
              <p className="text-emerald-900/50 font-medium">Open data and clear insights, no hidden agendas.</p>
            </div>
            <div className="space-y-4">
              <div className="text-emerald-500 font-black text-6xl opacity-20">03</div>
              <h3 className="text-xl font-black text-[#004d40]">Sustainable Future</h3>
              <p className="text-emerald-900/50 font-medium">Using tech to reduce waste and protect our soil for generations.</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
