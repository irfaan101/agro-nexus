import React from 'react';
import { FileText, CheckCircle, ShieldAlert, Users, Scale, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Terms: React.FC = () => {
  const [openSection, setOpenSection] = React.useState<number | null>(0);

  const terms = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: "By accessing or using Agro-Nexus, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform."
    },
    {
      icon: Users,
      title: "User Accounts",
      content: "You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate and complete information during registration and keep it updated."
    },
    {
      icon: ShieldAlert,
      title: "Data Security",
      content: "We use Firebase Authentication for secure identity management and Firestore for storing your scan history. You agree not to attempt to bypass any security measures or access data that does not belong to you."
    },
    {
      icon: AlertTriangle,
      title: "AI Scan Accuracy",
      content: "While our AI models are highly accurate (98%), they are intended for informational purposes only. Agro-Nexus is not responsible for any decisions made based on AI diagnosis results. Always consult with an agricultural expert for critical farming decisions."
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content: "Agro-Nexus shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services."
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
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">Terms of <span className="text-emerald-400">Service</span></h1>
          <p className="text-white/60 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Clear, transparent, and fair rules for our agricultural community.
          </p>
        </div>
      </section>

      {/* Accordion Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {terms.map((term, index) => (
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
                    <term.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-[#004d40]">{term.title}</h2>
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
                      {term.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Prohibited Uses Section */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-xl border border-emerald-100 rounded-[2.5rem] p-10 shadow-xl">
          <h2 className="text-2xl font-black text-[#004d40] mb-8">Prohibited Uses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              "Illegal or unauthorized platform use",
              "Hacking, scraping, or disruption",
              "Uploading malicious files",
              "Impersonating other users"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-emerald-900/60 font-bold text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center py-12">
        <p className="text-emerald-900/30 text-[10px] font-black uppercase tracking-[0.3em]">Last Updated: April 12, 2026</p>
      </div>
    </motion.div>
  );
};

export default Terms;
