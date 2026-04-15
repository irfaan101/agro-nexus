import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { auth, db, doc, setDoc, createUserWithEmailAndPassword, Timestamp, handleFirestoreError, OperationType, firebaseConfig, serverTimestamp, sendEmailVerification } from '../lib/firebase';
import { Leaf, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, RefreshCw, ArrowLeft, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

const Register: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNo: '',
    state: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'mobileNo') {
      // Allow only numbers and max 10 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  React.useEffect(() => {
    if (user && !loading && !isSubmitting && !success) {
      navigate('/');
    }
  }, [user, loading, navigate, isSubmitting, success]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.mobileNo.length < 10) {
      setError('Kripya sahi mobile number dalein');
      return;
    }
    if (!formData.state) {
      setError('Please select your state.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    
    // Log data for database preparation
    console.log('Registering user with data:', {
      ...formData,
      rank: 'NAV-KISAN',
      joinedDate: new Date(),
      totalScans: 0
    });

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser = userCredential.user;

      // Trigger Email Verification
      try {
        await sendEmailVerification(newUser);
        console.log('Verification email sent to:', formData.email);
      } catch (evError) {
        console.error('Failed to send verification email:', evError);
      }

      // Store user data in Firestore
      const userDocData = {
        uid: newUser.uid,
        fullName: formData.name,
        email: formData.email,
        mobileNo: `+91${formData.mobileNo}`,
        state: formData.state,
        role: 'NAV-KISAN',
        totalScans: 0,
        points: 0,
        joinedDate: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      try {
        await setDoc(doc(db, 'users', newUser.uid), userDocData);
      } catch (fsError) {
        handleFirestoreError(fsError, OperationType.WRITE, `users/${newUser.uid}`);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error('Full Firebase Error Object:', JSON.stringify(err, null, 2));
      console.error('Registration error code:', err.code);
      console.error('Registration error message:', err.message);
      
      const projectId = firebaseConfig.projectId;
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(`Email/Password authentication is not enabled in the Firebase Console for project: ${projectId}`);
      } else if (err.message?.includes('Firestore Error') || err.message?.includes('operationType')) {
        setError('Account created, but profile setup failed. Please contact support.');
      } else {
        setError(`Registration failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 py-12 px-6 my-20">
      <div className="max-w-md w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-3xl border border-emerald-100 shadow-2xl text-center space-y-8 relative overflow-hidden"
        >
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-800"></div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner">
              <UserPlus className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-emerald-900 tracking-tight">
                Create Account
              </h1>
              <p className="text-emerald-800/60 font-medium text-sm">
                Join the Agro-Nexus Farming Community
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
              Account Created! Verification email sent.
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleRegister} className="space-y-4 md:space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-800 uppercase tracking-widest ml-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-emerald-50/30 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium text-emerald-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-800 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="farmer@example.com"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-emerald-50/30 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium text-emerald-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-800 uppercase tracking-widest ml-1">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-emerald-100 pr-3 h-6 z-10">
                <span className="text-lg leading-none">🇮🇳</span>
                <span className="text-sm font-bold text-emerald-700">+91</span>
              </div>
              <input
                type="tel"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleInputChange}
                placeholder="Enter 10 digit number"
                className="w-full pl-24 pr-4 py-3.5 rounded-2xl bg-emerald-50/30 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium text-emerald-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-800 uppercase tracking-widest ml-1">
              State
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-emerald-50/30 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium text-emerald-900 appearance-none"
                required
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-800 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-emerald-50/30 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium text-emerald-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-800 uppercase tracking-widest ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-emerald-50/30 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium text-emerald-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="space-y-4 pt-4">
          <p className="text-sm font-medium text-emerald-800/60">
            <Link to="/login" title="Login" className="text-emerald-600 font-black hover:text-emerald-700 py-2 inline-block">
              Already have an account? Login
            </Link>
          </p>
          <div className="text-[10px] text-emerald-800/30 font-medium uppercase tracking-tighter">
            Agro-Nexus Secure Access • v2.0.1
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Register;
