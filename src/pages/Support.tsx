import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, collection, addDoc, Timestamp } from '../lib/firebase';
import { MessageSquare, User, Mail, Send, AlertCircle, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Support: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update name/email if user loads late
  React.useEffect(() => {
    if (user) {
      if (!name) setName(user.displayName || '');
      if (!email) setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user) {
      setError('You must be logged in to submit a support ticket.');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter your message.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: user.uid,
        name,
        email: user.email, // Always use the actual logged-in user's email
        message,
        status: 'open',
        createdAt: Timestamp.now()
      });

      setSuccess(true);
      setMessage('');
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-900 text-emerald-400 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl z-[100] animate-bounce';
      toast.innerText = 'Success! Ticket Submitted';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (err: any) {
      console.error('Support submission error:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 px-4 min-h-[70vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl border border-emerald-100 shadow-xl text-center space-y-8"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-black text-emerald-900 tracking-tight leading-none">
              Login Required
            </h1>
            <p className="text-emerald-700/70 font-medium leading-relaxed">
              Please log in to your account to contact our support team.
            </p>
          </div>
          <Link
            to="/login"
            className="block w-full py-4 rounded-2xl bg-emerald-900 text-emerald-400 font-black text-lg hover:bg-black transition-all shadow-lg shadow-emerald-100 mt-6"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 md:mt-24 px-4 mb-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-3xl border border-emerald-100 shadow-xl text-center space-y-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-emerald-900 tracking-tight leading-none">
            Contact Support
          </h1>
          <p className="text-emerald-700/70 font-medium leading-relaxed">
            Have a question or need help? Send us a message.
          </p>
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
              Message sent! We'll get back to you soon.
            </motion.div>
          )}
        </AnimatePresence>

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-800/40 uppercase tracking-widest ml-1">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-800/40 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-800/40 uppercase tracking-widest ml-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                rows={4}
                className="w-full px-4 py-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-emerald-900 text-emerald-400 font-black text-lg hover:bg-black transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4">
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-widest hover:text-emerald-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Support;
