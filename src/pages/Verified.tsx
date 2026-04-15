import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Leaf } from 'lucide-react';
import { motion } from 'motion/react';

const Verified: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white py-12 px-6">
      <div className="max-w-md w-full my-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[40px] border border-emerald-100 shadow-[0_20px_50px_rgba(5,150,105,0.1)] text-center space-y-8 relative overflow-hidden"
        >
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-600"></div>

          {/* Icon Section */}
          <div className="flex flex-col items-center gap-6">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-emerald-200 rounded-full blur-2xl opacity-40 animate-pulse"></div>
              <div className="w-24 h-24 rounded-[32px] bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner relative z-10">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
              </div>
            </motion.div>

            <div className="space-y-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Email Verified Successfully!
              </h1>
              <p className="text-slate-500 font-medium text-base leading-relaxed">
                Ab aap Agro-Nexus ke saare features use kar sakte hain. Chaliye shuru karte hain!
              </p>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 group"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Branding Footer */}
          <div className="pt-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 opacity-40">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Agro-Nexus</span>
            </div>
            <div className="text-[10px] text-emerald-800/20 font-medium uppercase tracking-tighter">
              Account Security Verified • v2.0.1
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Verified;
