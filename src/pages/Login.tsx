import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { signInWithGoogle, signInWithEmailAndPassword, auth, firebaseConfig, sendPasswordResetEmail } from '../lib/firebase';
import { Leaf, LogIn, Mail, Lock, AlertCircle, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Captcha State
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setCaptchaInput('');
  };

  React.useEffect(() => {
    generateCaptcha();
  }, []);

  React.useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      setSuccess(true);
      setTimeout(() => navigate('/'), 1000);
    } catch (error: any) {
      console.error('Google login failed:', error);
      setError(error.message || 'Google login failed. Please try again.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Captcha Validation
    if (captchaInput.toUpperCase() !== captchaText) {
      setError('Incorrect Captcha. Please try again.');
      generateCaptcha();
      return;
    }

    // Basic Validation
    if (!identifier.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, identifier, password);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      console.error('Login error:', err);
      const projectId = firebaseConfig.projectId;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(`Email/Password authentication is not enabled in the Firebase Console for project: ${projectId}`);
      } else {
        setError(`Login failed: ${err.message || 'An unexpected error occurred.'}`);
      }
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    
    setForgotLoading(true);
    setForgotMessage(null);
    
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotMessage({ type: 'success', text: 'Mubarak ho! Email bhej diya gaya hai. Apna inbox check karein' });
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotEmail('');
        setForgotMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setForgotMessage({ type: 'error', text: err.message || 'Failed to send reset link.' });
    } finally {
      setForgotLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest-light py-12 px-6">
      <div className="max-w-md w-full my-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(5,150,105,0.1)] text-center space-y-8 relative overflow-hidden"
        >
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-600"></div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner">
              <Leaf className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {t('auth.welcome')}
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                Secure Agricultural Access Portal
              </p>
            </div>
          </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-bold"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              Login Successful! Redirecting...
            </motion.div>
          )}
        </AnimatePresence>

          <form onSubmit={handleEmailLogin} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-800 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="farmer@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-emerald-50/30 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                  Password
                </label>
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-emerald-50/30 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Alphanumeric Captcha Section */}
            <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  Security Verification
                </label>
                <button type="button" onClick={generateCaptcha} className="text-emerald-600 hover:rotate-180 transition-transform duration-500 p-1">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-900/90 text-emerald-400 px-4 py-3 rounded-xl font-mono font-black text-xl tracking-[0.3em] select-none italic shadow-inner flex-1 text-center border border-slate-800 transform -skew-x-6">
                  {captchaText}
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Code"
                  className="w-28 px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-center text-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-emerald-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-emerald-800/40 font-black tracking-widest">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold text-lg shadow-sm hover:bg-slate-50 transition-all hover:scale-[1.01] active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          {t('auth.signin')}
        </button>

        <div className="space-y-4 pt-4">
          <p className="text-sm font-medium text-emerald-800/60">
            Don't have an account?{' '}
            <Link to="/register" title="Register" className="text-emerald-600 font-black hover:text-emerald-700">
              Create Account
            </Link>
          </p>
          <div className="text-[10px] text-emerald-800/30 font-medium uppercase tracking-tighter">
            Agro-Nexus Secure Access • v2.0.1
          </div>
        </div>
      </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm relative z-10 border border-emerald-100"
            >
              <button 
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-emerald-50 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">Reset Password</h3>
                  <p className="text-slate-500 text-sm">Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4 text-left pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="farmer@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-emerald-50/30 border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  {forgotMessage && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      forgotMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {forgotMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {forgotMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Link'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
