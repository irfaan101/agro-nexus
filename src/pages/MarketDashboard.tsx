import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart2, 
  Upload, 
  Search, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Leaf,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MandiItem {
  commodity: string;
  modal_price: string;
  market: string;
  state: string;
  district: string;
  arrival_date: string;
}

interface PredictionResult {
  class: string;
  confidence: number;
  predictions: Record<string, number>;
}

const MarketDashboard: React.FC = () => {
  // Mandi State
  const [mandiData, setMandiData] = useState<MandiItem[]>([]);
  const [mandiLoading, setMandiLoading] = useState(true);
  const [mandiError, setMandiError] = useState<string | null>(null);

  // Prediction State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictResult, setPredictResult] = useState<PredictionResult | null>(null);
  const [predictError, setPredictError] = useState<string | null>(null);

  // Fetch Mandi Data
  const fetchMandiData = async () => {
    setMandiLoading(true);
    setMandiError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/mandi');
      // Assuming the API returns the records array directly or inside a 'records' key
      const records = response.data.records || response.data;
      setMandiData(Array.isArray(records) ? records : []);
    } catch (err: any) {
      console.error('Mandi Fetch Error:', err);
      setMandiError('Failed to fetch market rates. Please ensure the backend is running on port 5000.');
    } finally {
      setMandiLoading(false);
    }
  };

  useEffect(() => {
    fetchMandiData();
  }, []);

  // Handle Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPredictResult(null);
      setPredictError(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    setPredictLoading(true);
    setPredictError(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5001/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPredictResult(response.data);
    } catch (err: any) {
      console.error('Prediction Error:', err);
      setPredictError('Prediction failed. Please ensure the AI backend is running on port 5001.');
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-light p-6 md:p-12 space-y-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-forest-deep tracking-tight mb-2">Market & AI Dashboard</h1>
        <p className="text-forest-deep/60 font-medium">Real-time Mandi rates and AI-powered crop disease detection.</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Section 1: Mandi Rates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-forest-mint/10 rounded-2xl flex items-center justify-center text-forest-mint">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-forest-deep">Live Mandi Rates</h2>
            </div>
            <button 
              onClick={fetchMandiData}
              className="p-3 bg-white rounded-xl border border-forest-mint/10 text-forest-mint hover:bg-forest-mint/5 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${mandiLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-forest-mint/10 overflow-hidden shadow-xl shadow-forest-deep/5">
            {mandiLoading ? (
              <div className="p-12 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-forest-light animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : mandiError ? (
              <div className="p-12 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <p className="text-forest-deep/60 font-medium">{mandiError}</p>
                <button 
                  onClick={fetchMandiData}
                  className="px-6 py-2 bg-forest-deep text-white rounded-xl font-bold text-sm"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-forest-light/50 border-b border-forest-mint/10">
                      <th className="px-6 py-4 text-[10px] font-black text-forest-mint uppercase tracking-widest">Commodity</th>
                      <th className="px-6 py-4 text-[10px] font-black text-forest-mint uppercase tracking-widest">Market</th>
                      <th className="px-6 py-4 text-[10px] font-black text-forest-mint uppercase tracking-widest text-right">Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-mint/5">
                    {mandiData.length > 0 ? mandiData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-forest-light/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-forest-mint/10 flex items-center justify-center text-forest-mint group-hover:scale-110 transition-transform">
                              <Leaf className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-forest-deep">{item.commodity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-forest-deep/60 text-sm font-medium">
                            <MapPin className="w-3 h-3" />
                            {item.market}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <TrendingUp className="w-3 h-3 text-forest-mint" />
                            <span className="font-black text-forest-deep">₹{item.modal_price}</span>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-forest-deep/40 font-bold">No records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: AI Disease Prediction */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-forest-mint/10 rounded-2xl flex items-center justify-center text-forest-mint">
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-forest-deep">AI Disease Predictor</h2>
          </div>

          <div className="bg-white rounded-[32px] border border-forest-mint/10 p-8 shadow-xl shadow-forest-deep/5 space-y-8">
            {/* Upload Area */}
            <div 
              onClick={() => document.getElementById('file-upload')?.click()}
              className={`relative h-64 rounded-[24px] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
                previewUrl ? 'border-forest-mint bg-forest-light' : 'border-forest-mint/20 hover:border-forest-mint/40 hover:bg-forest-mint/5'
              }`}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-forest-mint/10 rounded-2xl flex items-center justify-center mx-auto text-forest-mint">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-forest-deep uppercase tracking-widest text-xs">Upload Crop Image</p>
                    <p className="text-forest-deep/40 text-[10px] font-bold">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              )}
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                onChange={handleFileChange} 
                accept="image/*" 
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handlePredict}
              disabled={!selectedFile || predictLoading}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${
                !selectedFile || predictLoading 
                  ? 'bg-forest-deep/10 text-forest-deep/30 cursor-not-allowed' 
                  : 'bg-forest-deep text-white shadow-xl shadow-forest-deep/20 active:scale-95'
              }`}
            >
              {predictLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Predict Disease
                </>
              )}
            </button>

            {/* Result Display */}
            <AnimatePresence>
              {predictResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-forest-light rounded-2xl border border-forest-mint/10 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-forest-mint rounded-xl flex items-center justify-center text-white">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-forest-mint uppercase tracking-widest">Prediction Result</p>
                      <h3 className="text-xl font-black text-forest-deep">{predictResult.class}</h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-forest-deep/60">
                    <span>Confidence Score</span>
                    <span className="text-forest-mint">{(predictResult.confidence * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full h-2 bg-forest-mint/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${predictResult.confidence * 100}%` }}
                      className="h-full bg-forest-mint"
                    />
                  </div>
                </motion.div>
              )}

              {predictError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-xs font-bold">{predictError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarketDashboard;
