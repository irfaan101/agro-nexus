import React from 'react';
import { Shield, Lock, Eye, Database, Server, UserCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PrivacyPolicy: React.FC = () => {
  const [openSection, setOpenSection] = React.useState<number | null>(0);

  const sections = [
    {
      icon: UserCheck,
      title: "Identity & Authentication",
      content: "We use Firebase Authentication to securely manage your identity. Your login credentials are encrypted and never stored directly on our servers. This ensures that only you can access your personal farming data and scan history."
    },
    {
      icon: Eye,
      title: "Crop Image Handling",
      content: "When you upload a crop image for AI scanning, the image is processed securely. We use these images to provide you with accurate disease diagnosis. Your images are stored in secure Firebase Storage buckets with strict access controls."
    },
    {
      icon: Database,
      title: "Scan History & Firestore",
      content: "Your scan results and history are stored in Google Cloud Firestore. This allows you to track the health of your crops over time. We implement granular security rules to ensure that your data is only accessible by you."
    },
    {
      icon: Shield,
      title: "Data Protection",
      content: "We are committed to protecting farmer data. We do not sell your personal information to third parties. All data transmission is encrypted using industry-standard SSL/TLS protocols."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8fafc] pb-20 font-sans"
    >
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 bg-[#004d40] relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="w-16 h-16 bg-emerald-400/10 border border-emerald-400/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 mb-6 backdrop-blur-md">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">Privacy <span className="text-emerald-400">Policy</span></h1>
          <p className="text-white/60 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Your farming data is your livelihood. We protect it with the same care you give your crops.
          </p>
        </div>
      </section>

      {/* Accordion Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 backdrop-blur-xl border border-emerald-100 rounded-[2rem] overflow-hidden shadow-xl shadow-emerald-900/5"
            >
              <button 
                onClick={() => setOpenSection(openSection === index ? null : index)}
                className="w-full p-8 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-[#004d40]">{section.title}</h2>
                </div>
                <motion.div
                  animate={{ rotate: openSection === index ? 180 : 0 }}
                  className="text-emerald-300"
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openSection === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-8 pb-8"
                  >
                    <div className="pt-4 border-t border-emerald-50 text-emerald-900/60 font-medium leading-relaxed text-lg">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto bg-[#004d40] rounded-[2.5rem] p-10 text-white shadow-2xl">
          <h2 className="text-2xl font-black mb-6">Information We Collect</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-emerald-400 font-black text-xs uppercase tracking-widest">Identity</div>
              <p className="text-white/60 text-sm font-medium">Name, Mobile, and Email for secure access.</p>
            </div>
            <div className="space-y-2">
              <div className="text-emerald-400 font-black text-xs uppercase tracking-widest">Visuals</div>
              <p className="text-white/60 text-sm font-medium">Crop images for AI-powered disease diagnosis.</p>
            </div>
            <div className="space-y-2">
              <div className="text-emerald-400 font-black text-xs uppercase tracking-widest">Location</div>
              <p className="text-white/60 text-sm font-medium">GPS data for local weather and mandi rates.</p>
            </div>
            <div className="space-y-2">
              <div className="text-emerald-400 font-black text-xs uppercase tracking-widest">Usage</div>
              <p className="text-white/60 text-sm font-medium">Interaction data to improve our AI models.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center py-12">
        <p className="text-emerald-900/30 text-[10px] font-black uppercase tracking-[0.3em]">Last Updated: April 12, 2026</p>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
