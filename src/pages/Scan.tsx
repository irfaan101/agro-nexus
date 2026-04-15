import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db, collection, setDoc, doc, Timestamp, updateDoc, increment, getDoc } from '../lib/firebase';
import { calculateRank } from '../lib/userUtils';
import { Camera, Upload, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck, X, Zap, Leaf, History as HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { detectPlantDisease } from '../services/geminiService';

const Scan: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        setResult(null);
        runDetection(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setImage(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied.');
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(dataUrl);
        
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraOpen(false);

        // Auto-start scanning as requested
        runDetection(dataUrl);
      }
    }
  };

  const runDetection = async (capturedImage?: string) => {
    const targetImage = capturedImage || image;
    if (!targetImage || !user) return;
    
    setIsScanning(true);
    setError(null);

    try {
      // Analyze image using Gemini
      const detection = await detectPlantDisease(targetImage);
      setResult(detection);

      // Save to Firestore
      const scanRef = doc(collection(db, 'scans'));
      await setDoc(scanRef, {
        userId: user.uid,
        cropName: detection.species,
        diseaseName: detection.disease,
        confidence: detection.confidence,
        description: detection.description,
        solutionEn: detection.solutionEn,
        solutionHi: detection.solutionHi,
        organicTreatment: detection.organicTreatment,
        imageUrl: targetImage,
        timestamp: Timestamp.now()
      });

      // Update User Stats and Points
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newScanCount = (userData.totalScans || 0) + 1;
        const newRank = calculateRank(newScanCount);
        
        await updateDoc(userRef, {
          totalScans: increment(1),
          points: increment(10),
          role: newRank, // Sync rank to Firestore 'role' field
          lastScanDate: Timestamp.now()
        });
      }

    } catch (err) {
      console.error('Scan error:', err);
      setError('An error occurred during scanning. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const reportContent = `
AGRO-NEXUS DIAGNOSIS REPORT
---------------------------
Date: ${new Date().toLocaleString()}
User ID: ${user?.uid}

PLANT ANALYSIS:
Species: ${result.species}
Condition: ${result.disease}
Confidence Score: ${(result.confidence * 100).toFixed(2)}%

DESCRIPTION:
${result.description}

RECOMMENDED SOLUTION:
${result.solutionEn}

ORGANIC TREATMENT PLAN:
${result.organicTreatment.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

---------------------------
Generated via Gemini 3.1 Flash
    `;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgroNexus_Report_${result.species}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!user) {
    return (
      <div className="px-6 my-20 text-center space-y-6 bg-forest-light min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-forest-mint/10 rounded-[32px] flex items-center justify-center mx-auto border border-forest-mint/20">
          <ShieldCheck className="w-12 h-12 text-forest-mint" />
        </div>
        <h2 className="text-3xl font-black text-forest-deep tracking-tight">Sign in to scan</h2>
        <p className="text-forest-deep/60 font-medium leading-relaxed max-w-xs mx-auto">You need to be logged in to use the AI scanner and save your history.</p>
        <button
          onClick={() => navigate('/login')}
          className="w-full max-w-xs py-5 bg-forest-deep text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-forest-deep/20"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest-light py-8 px-5 md:px-10">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Crop Scan</h1>
            <p className="text-[11px] text-slate-500 font-medium">AI-powered crop disease detection</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-xl font-semibold text-xs border border-emerald-100 shadow-sm hover:bg-emerald-50 transition-colors"
          >
            <HistoryIcon className="w-3.5 h-3.5" />
            View History
          </button>
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl shadow-forest-deep/5 overflow-hidden border border-forest-mint/5">
          {/* Camera/Upload Interface */}
          <div className="relative aspect-video md:aspect-[16/9] bg-forest-light flex items-center justify-center overflow-hidden">
            {isCameraOpen ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = reader.result as string;
                      setImage(dataUrl);
                      setResult(null);
                      runDetection(dataUrl);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full h-full flex flex-col items-center justify-center p-12 cursor-pointer group"
              >
                <div className="w-full h-full border-4 border-dashed border-forest-mint/20 rounded-[32px] bg-emerald-50/50 flex flex-col items-center justify-center space-y-6 group-hover:bg-emerald-50 group-hover:border-forest-mint/40 transition-all">
                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl shadow-forest-mint/10 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-forest-mint" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-lg font-semibold text-forest-deep tracking-tight">Drag & Drop or Click</p>
                    <p className="text-[10px] text-slate-400 font-medium tracking-widest">Upload crop photo for analysis</p>
                  </div>
                </div>
              </div>
            )}

            {/* Focus Square Overlay */}
            {(isCameraOpen || (image && !result)) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 md:w-80 md:h-80 border-2 border-white/10 rounded-[40px] relative">
                  <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-forest-mint rounded-tl-[32px]"></div>
                  <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-forest-mint rounded-tr-[32px]"></div>
                  <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-forest-mint rounded-bl-[32px]"></div>
                  <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-forest-mint rounded-br-[32px]"></div>
                  
                  {isScanning && (
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-4 right-4 h-1 bg-forest-mint/50 shadow-[0_0_20px_rgba(64,145,108,0.8)] z-10 rounded-full"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Processing Animation */}
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-forest-deep/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-8 text-center"
                >
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-40 h-40 bg-forest-mint rounded-full blur-3xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="w-16 h-16 text-white animate-spin" />
                    </div>
                  </div>
                  <div className="mt-12 space-y-4">
                    <p className="text-white font-black uppercase tracking-[0.4em] text-xs">Analyzing via Gemini AI</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1 h-1 bg-forest-mint rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-forest-mint rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-forest-mint rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close/Reset Button */}
            {(image || isCameraOpen) && !isScanning && (
              <button 
                onClick={() => { setIsCameraOpen(false); setImage(null); setResult(null); }}
                className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/10 hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Controls Area */}
          <div className="p-3 md:p-10 space-y-8">
            {!result ? (
              <>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full md:flex-1 flex flex-col items-center gap-3 p-6 rounded-[32px] bg-forest-light border border-forest-mint/5 text-forest-deep active:scale-95 transition-all hover:bg-forest-mint/10 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-forest-mint group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold tracking-tight">Gallery</span>
                  </button>

                  <button
                    onClick={isCameraOpen ? capturePhoto : startCamera}
                    className="w-24 h-24 rounded-full bg-forest-mint flex items-center justify-center text-white shadow-2xl shadow-forest-mint/40 active:scale-90 transition-all border-[10px] border-white group relative"
                  >
                    <div className="absolute inset-0 rounded-full bg-forest-mint animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    {isCameraOpen ? (
                      <div className="flex flex-col items-center relative z-10">
                        <Zap className="w-10 h-10 fill-white" />
                        <span className="text-xs font-bold tracking-tight mt-1">Capture</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center relative z-10">
                        <Camera className="w-10 h-10" />
                        <span className="text-xs font-bold tracking-tight mt-1">Camera</span>
                      </div>
                    )}
                  </button>

                  <div className="hidden md:flex md:flex-1" />
                </div>

                {image && !isScanning && !result && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => runDetection()}
                    className="w-full py-6 bg-forest-deep text-forest-mint rounded-[24px] font-black text-lg active:scale-95 transition-all shadow-2xl shadow-forest-deep/20 uppercase tracking-widest"
                  >
                    Analyze Crop
                  </motion.button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Result Header Card */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-forest-light rounded-[32px] border border-forest-mint/10 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-forest-mint/10 rounded-[24px] flex items-center justify-center text-forest-mint">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 leading-none mb-2">Diagnosis Ready</h2>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                          {result.species}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-48 space-y-2">
                    <div className={`flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${result.confidence > 0.9 ? 'text-emerald-500' : 'text-forest-mint'}`}>
                      <span>Confidence</span>
                      <span>{(result.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-4 bg-white rounded-full overflow-hidden border border-forest-mint/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-forest-mint rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Condition Card */}
                  <div className="p-8 bg-white rounded-[32px] border border-forest-mint/10 shadow-md hover:shadow-lg transition-shadow space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-forest-mint" />
                      <p className="text-[10px] font-black text-forest-mint uppercase tracking-[0.3em]">Detected Condition</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{result.disease}</p>
                    <p className="text-sm font-medium text-forest-deep/60 leading-relaxed">
                      {result.description}
                    </p>
                  </div>

                  {/* Advice Card */}
                  <div className="p-8 bg-emerald-900 rounded-[32px] text-white space-y-4 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-forest-mint" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-forest-mint">Expert Advice</p>
                    </div>
                    <p className="text-lg font-bold italic text-white leading-relaxed">
                      "{language === 'en' ? result.solutionEn : result.solutionHi}"
                    </p>
                  </div>
                </div>

                {/* Treatment Card */}
                <div className="p-8 bg-white rounded-[32px] border border-forest-mint/10 shadow-md hover:shadow-lg transition-shadow space-y-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-forest-mint" />
                    <p className="text-[10px] font-black text-forest-mint uppercase tracking-[0.3em]">Organic Treatment Plan</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.organicTreatment.map((step: string, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-forest-light/50 border border-forest-mint/5 border-l-4 border-l-emerald-500">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm font-medium text-forest-deep/80 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <button
                    onClick={downloadReport}
                    className="flex-1 py-5 bg-white text-emerald-600 border-2 border-emerald-600 rounded-[24px] font-black uppercase tracking-widest text-xs active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-emerald-50"
                  >
                    <Zap className="w-4 h-4" />
                    Download Report
                  </button>
                  <button
                    onClick={() => { setImage(null); setResult(null); }}
                    className="flex-1 py-5 bg-emerald-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-emerald-600/20 hover:bg-emerald-700"
                  >
                    Scan Another
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scan;
