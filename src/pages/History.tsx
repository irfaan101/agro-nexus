import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db, collection, query, where, orderBy, onSnapshot, handleFirestoreError, OperationType } from '../lib/firebase';
import { History as HistoryIcon, Calendar, Leaf, ChevronRight, Search, Filter, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const History: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'scans'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scanData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a: any, b: any) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });
      setScans(scanData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scans');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredScans = scans.filter(scan => 
    (scan.cropName?.toLowerCase() || '').includes(filter.toLowerCase()) ||
    (scan.diseaseName?.toLowerCase() || '').includes(filter.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{t('history.title')}</h1>
          <p className="text-slate-600 font-medium">Review your past crop disease detections.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input
            type="text"
            placeholder="Search scans..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-emerald-100 focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
          />
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredScans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredScans.map((scan, idx) => (
              <motion.div
                key={scan.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={scan.imageUrl} 
                    alt={scan.diseaseName} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {scan.timestamp?.toDate().toLocaleDateString()}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{scan.cropName}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {(scan.confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{scan.diseaseName}</h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-800/40 uppercase tracking-widest mb-2">Solution</p>
                    <p className="text-sm text-emerald-800 font-medium line-clamp-3 italic">
                      "{language === 'en' ? scan.solutionEn : scan.solutionHi}"
                    </p>
                  </div>

                  <button className="w-full py-3 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2 mb-2">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 space-y-4 bg-white rounded-3xl border border-emerald-100"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <HistoryIcon className="w-10 h-10 text-emerald-200" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900">{t('history.empty')}</h2>
            <p className="text-emerald-700/70 max-w-sm mx-auto">Start scanning your crops to see your history here.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
