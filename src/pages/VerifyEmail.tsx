import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, logout } from '../lib/firebase';
import { Mail, RefreshCw, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const VerifyEmail: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.emailVerified) {
      navigate('/');
      return;
    }

    // Auto-refresh logic: check every 4 seconds
    const interval = setInterval(async () => {
      try {
        await user.reload();
        if (auth.currentUser?.emailVerified) {
          clearInterval(interval);
          navigate('/verified');
        }
      } catch (error) {
        console.error("Error reloading user:", error);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      await user?.reload();
      if (auth.currentUser?.emailVerified) {
        navigate('/verified');
      } else {
        setMessage({ type: 'error', text: 'Email abhi tak verify nahi hua hai. Kripya link par click karein.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Check karne mein galti hui. Kripya phir koshish karein.' });
    } finally {
      setIsChecking(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white py-12 px-6">
      <div className="max-w-md w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-[40px] border border-emerald-100 shadow-[0_20px_50px_rgba(5,150,105,0.1)] text-center space-y-8 relative overflow-hidden"
        >
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500"></div>

          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-inner">
              <Mail className="w-10 h-10 text-amber-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Account Created!
              </h1>
              <p className="text-emerald-800 font-black text-lg">
                Lekin pehle apna Email Verify karein
              </p>
              <p className="text-slate-500 font-medium text-sm px-4">
                Humne aapke email <span className="text-emerald-600 font-bold">{user?.email}</span> par ek verification link bheja hai.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <button
              onClick={handleManualCheck}
              disabled={isChecking}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isChecking ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Maine Verify Kar Liya'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Back to Login
            </button>
          </div>

          <div className="pt-4">
            <p className="text-xs text-slate-400 font-medium italic">
              Link nahi mila? Spam folder check karein ya thoda intezar karein.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;
