import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, doc, onSnapshot, updateDoc, handleFirestoreError, OperationType, storage, ref, uploadBytes, getDownloadURL, logout, collection, query, where, increment } from '../lib/firebase';
import { calculateRank } from '../lib/userUtils';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  LogOut,
  RefreshCw,
  Activity,
  Layers,
  Maximize,
  Sprout,
  ShieldCheck,
  CheckCircle,
  Tractor,
  Crown,
  ChevronRight,
  Info,
  Award,
  ShieldAlert,
  Zap,
  Microscope,
  Droplets,
  Bug,
  History,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  createdAt: any;
  location?: string;
  bio?: string;
  photoURL?: string;
  soilType?: string;
  landArea?: string;
  primaryCrops?: string;
  healthScore?: number;
  activeAlerts?: number;
  savedMandis?: number;
  points?: number;
}

interface ScanRecord {
  id: string;
  imageUrl: string;
  diagnosis: string;
  timestamp: any;
  cropName: string;
}

const TIERS = [
  { 
    min: 0, 
    max: 5, 
    name: 'NAV-KISAN', 
    color: 'bg-[#059669] text-white border-white/20', 
    icon: Sprout, 
    next: 6,
    effect: 'shine'
  },
  { 
    min: 6, 
    max: 20, 
    name: 'JAGRUK KISAN', 
    color: 'bg-gradient-to-br from-amber-400 to-orange-600 text-white border-white/20 shadow-[0_0_20px_rgba(251,191,36,0.3)]', 
    icon: ShieldCheck, 
    next: 21,
    effect: 'glow'
  },
  { 
    min: 21, 
    max: 50, 
    name: 'AGRO-EXPERT', 
    color: 'bg-gradient-to-br from-emerald-500/90 to-teal-700/90 text-white border-white/30 backdrop-blur-md', 
    icon: CheckCircle, 
    next: 51,
    effect: 'glass'
  },
  { 
    min: 51, 
    max: 100, 
    name: 'HARVEST MASTER', 
    color: 'bg-gradient-to-br from-orange-500 to-red-700 text-white border-white/20 shadow-[inset_0_4px_8px_rgba(0,0,0,0.2)]', 
    icon: Tractor, 
    next: 101,
    effect: 'pressed'
  },
  { 
    min: 101, 
    max: Infinity, 
    name: 'ADARSH KISAN', 
    color: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white border-yellow-400/50 shadow-[0_0_30px_rgba(147,51,234,0.5)]', 
    icon: Crown, 
    next: null,
    effect: 'royal'
  },
];

const SOIL_TYPES = [
  'Alluvial Soil',
  'Black Soil (Regur)',
  'Red and Yellow Soil',
  'Laterite Soil',
  'Arid/Desert Soil',
  'Mountain/Forest Soil',
  'Peaty/Marshy Soil',
  'Saline/Alkaline Soil'
];

const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [scanCount, setScanCount] = useState<number>(0);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [isSyncingTier, setIsSyncingTier] = useState(false);
  
  // Profile Picture States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        if (!isEditing) {
          setEditForm(data);
        }
        setImgError(false);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching profile:', error);
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isEditing]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'scans'), 
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setScanCount(snapshot.size);
      
      // Get last 3 scans
      const scans = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ScanRecord))
        .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
        .slice(0, 3);
      setRecentScans(scans);
    }, (error) => {
      console.error('Error fetching scans:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync Tier with Database
  useEffect(() => {
    if (!user || !profile || isSyncingTier) return;

    const newTier = calculateRank(scanCount);
    // Sync if role is 'client' or doesn't match the calculated tier
    if (profile.role?.toLowerCase() === 'client' || profile.role !== newTier.toUpperCase()) {
      const syncTier = async () => {
        setIsSyncingTier(true);
        try {
          const docRef = doc(db, 'users', user.uid);
          await updateDoc(docRef, { 
            role: newTier.toUpperCase(),
            updatedAt: new Date()
          });
          console.log(`Tier synced to database: ${newTier.toUpperCase()}`);
        } catch (error) {
          console.error('Error syncing tier:', error);
        } finally {
          setIsSyncingTier(false);
        }
      };
      syncTier();
    }
  }, [scanCount, profile?.role, user]);

  // Camera Functions
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setMessage({ type: 'error', text: 'Could not access camera.' });
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Resize to a very small square for Firestore storage (Base64)
        // 200x200 is plenty for a profile avatar and keeps size very low
        const size = 200;
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        
        // Calculate crop to center
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        const minSize = Math.min(videoWidth, videoHeight);
        const startX = (videoWidth - minSize) / 2;
        const startY = (videoHeight - minSize) / 2;

        context.drawImage(videoRef.current, startX, startY, minSize, minSize, 0, 0, size, size);
        
        // Generate a compressed Base64 string (JPEG quality 0.6 is usually < 20KB)
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6);
        savePhotoToFirestore(base64);
        stopCamera();
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 200; // Small size for Spark plan compatibility
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Square crop
            const minSize = Math.min(img.width, img.height);
            const startX = (img.width - minSize) / 2;
            const startY = (img.height - minSize) / 2;
            ctx.drawImage(img, startX, startY, minSize, minSize, 0, 0, size, size);
            
            // Compress to Base64
            const base64 = canvas.toDataURL('image/jpeg', 0.6);
            savePhotoToFirestore(base64);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const savePhotoToFirestore = async (base64: string) => {
    if (!user) return;
    
    setUploadingPhoto(true);
    setMessage(null);

    try {
      console.log("Saving compressed Base64 photo to Firestore...");
      
      // Update the user's Firestore document directly with the Base64 string
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { photoURL: base64 });

      // Update local state
      setProfile(prev => prev ? { ...prev, photoURL: base64 } : null);
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      console.log("Base64 photo sync complete.");
    } catch (error: any) {
      console.error("Error saving photo to Firestore:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      setMessage({ type: 'error', text: 'Failed to save photo. Please try again.' });
    } finally {
      // Ensure loading state is ALWAYS cleared
      setUploadingPhoto(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUpdateLoading(true);
    setMessage(null);

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        ...editForm,
        points: increment(5),
        updatedAt: new Date()
      });
      
      setProfile({ ...profile!, ...editForm, points: (profile.points || 0) + 5 });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-xl">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-[25px] font-black text-black mb-2">Profile Not Found</h2>
        <p className="text-black font-medium mb-6">Please login to view your profile.</p>
        <button onClick={() => window.location.href = '/login'} className="w-full py-4 bg-black text-white rounded-2xl font-black shadow-lg shadow-black/10">
          Go to Login
        </button>
      </div>
    );
  }

  const creationDate = profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'N/A';

  const currentTier = TIERS.find(t => scanCount >= t.min && scanCount <= t.max) || TIERS[0];
  const TierIcon = currentTier.icon;
  
  const progressToNext = currentTier.next 
    ? Math.round(((scanCount - currentTier.min) / (currentTier.next - currentTier.min)) * 100)
    : 100;

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4 py-8 md:py-20 font-sans pb-24 md:pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-none md:rounded-[2.5rem] border-x-0 md:border border-emerald-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
          >
            {/* Glassmorphism Header */}
            <div className="h-40 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000" 
                alt="Agri Landscape" 
                className="absolute inset-0 w-full h-full object-cover blur-[2px]"
              />
              <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-md border-b border-white/20"></div>
              
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="relative group">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-[2rem] bg-white p-1.5 shadow-2xl overflow-hidden cursor-pointer group"
                  >
                    <div className="w-full h-full rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-black text-5xl font-black border border-gray-100 overflow-hidden relative">
                      {profile.photoURL && profile.photoURL !== null && !imgError ? (
                        <img 
                          src={profile.photoURL} 
                          alt={profile.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        profile.name ? profile.name[0].toUpperCase() : 'R'
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Change</span>
                      </div>

                      {uploadingPhoto && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-white">
                          <RefreshCw className="w-5 h-5 animate-spin mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Updating...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 right-0 flex gap-1.5">
                    <button 
                      onClick={startCamera}
                      className="p-2.5 bg-[#059669] rounded-xl shadow-lg border border-emerald-500 text-white hover:bg-[#047857] hover:scale-110 transition-transform"
                      title="Take Photo with Camera"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-16 pb-8 px-6 md:px-8 text-center">
              <h2 className="text-xl md:text-[25px] font-black text-black mb-2 tracking-tight">{profile.name}</h2>
              
              {/* Dynamic Tier Badge */}
              <div className="flex justify-center mb-6">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`px-6 md:px-8 py-2.5 md:py-3 rounded-full border flex items-center gap-2 md:gap-3 relative overflow-hidden group ${currentTier.color}`}
                >
                  {/* Shine Effect for NAV-KISAN and ADARSH KISAN */}
                  {(currentTier.effect === 'shine' || currentTier.effect === 'royal') && (
                    <motion.div 
                      initial={{ left: '-100%' }}
                      animate={{ left: '200%' }}
                      transition={{ 
                        duration: currentTier.effect === 'royal' ? 2 : 3, 
                        repeat: Infinity, 
                        ease: "linear",
                        repeatDelay: 1
                      }}
                      className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-0"
                    />
                  )}

                  {/* Royal Pulse for ADARSH KISAN */}
                  {currentTier.effect === 'royal' && (
                    <motion.div 
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-yellow-400/10 z-0"
                    />
                  )}

                  <TierIcon className="w-5 h-5 drop-shadow-sm relative z-10" />
                  <span className="text-[15px] font-extrabold uppercase tracking-tighter drop-shadow-md relative z-10">
                    {currentTier.name}
                  </span>
                </motion.div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-[#059669] text-[15px] font-bold mb-8">
                <Calendar className="w-4 h-4" />
                <span className="text-black">JOINED {creationDate.toUpperCase()}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div 
                  onClick={() => navigate('/history')}
                  className="p-4 md:p-5 rounded-2xl bg-slate-100 border border-emerald-100/20 shadow-sm text-left flex flex-col justify-between cursor-pointer hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#059669] group-hover:scale-110 transition-transform shadow-sm">
                      <Camera className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Scans</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-xl md:text-2xl font-bold text-slate-900">{scanCount}</p>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div 
                  className="p-4 md:p-5 rounded-2xl bg-slate-100 border border-emerald-100/20 shadow-sm text-left flex flex-col justify-between transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-sm">
                      <Star className="w-5 h-5 fill-amber-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Agro-Points</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-xl md:text-2xl font-bold text-slate-900">{profile.points || 0}</p>
                    <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                      <Zap className="w-2 h-2 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div 
                  onClick={() => setShowBadgesModal(true)}
                  className="p-5 md:p-6 rounded-2xl bg-slate-100 border border-emerald-100/20 shadow-sm text-left cursor-pointer hover:scale-[1.01] transition-all group relative"
                >
                  <div className="absolute top-6 right-6">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] md:text-[12px] font-black text-slate-500 uppercase tracking-widest">Next Rank Progress</p>
                        <Award className="w-3 h-3 text-emerald-500 group-hover:animate-bounce" />
                      </div>
                      <p className="text-sm md:text-[16px] font-bold text-black">
                        {currentTier.next ? `${currentTier.next - scanCount} scans to ${TIERS.find(t => t.min === currentTier.next)?.name}` : 'Max Rank Achieved'}
                      </p>
                    </div>
                    <span className="text-xs md:text-[14px] font-bold text-black">{progressToNext}%</span>
                  </div>
                  <div className="h-2.5 md:h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNext}%` }}
                      className={`h-full rounded-full ${currentTier.color.split(' ').filter(c => c.startsWith('bg-gradient') || c.startsWith('from-') || c.startsWith('via-') || c.startsWith('to-') || c.startsWith('bg-[#')).join(' ')}`}
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowLogoutModal(true)}
                className="w-full py-4 rounded-full border-2 border-red-100 text-red-500 font-black text-[14px] uppercase tracking-[0.2em] hover:bg-red-50 hover:border-red-200 hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Details & Edit */}
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-none md:rounded-[2.5rem] border-x-0 md:border border-emerald-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-4 md:p-12"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-[32px] font-bold text-black tracking-tight uppercase">Account Details</h1>
                <p className="text-base md:text-[18px] text-black font-medium">Manage your personal information and preferences</p>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-[#059669] text-white rounded-full font-black text-[16px] shadow-lg shadow-emerald-100 hover:bg-[#047857] hover:scale-105 transition-all active:scale-95 w-full md:w-auto"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>

              <AnimatePresence mode="wait">
                {message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold text-[15px] ${
                      message.type === 'success' ? 'bg-emerald-50 text-[#059669] border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}
                  >
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[14px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                         type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none font-bold text-black"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-black text-slate-500 uppercase tracking-widest ml-1">Soil Type</label>
                    <div className="relative">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select 
                        value={editForm.soilType || ''}
                        onChange={(e) => setEditForm({ ...editForm, soilType: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none font-bold text-black appearance-none"
                      >
                        <option value="">Select Soil Type</option>
                        {SOIL_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-black text-slate-500 uppercase tracking-widest ml-1">Land Area (Acres)</label>
                    <div className="relative">
                      <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text"
                        value={editForm.landArea || ''}
                        onChange={(e) => setEditForm({ ...editForm, landArea: e.target.value })}
                        placeholder="e.g. 5.5"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none font-bold text-black"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Crops</label>
                    <div className="relative">
                      <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text"
                        value={editForm.primaryCrops || ''}
                        onChange={(e) => setEditForm({ ...editForm, primaryCrops: e.target.value })}
                        placeholder="e.g. Wheat, Rice, Cotton"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none font-bold text-black"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[14px] font-black text-slate-500 uppercase tracking-widest ml-1">Email (Read Only)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600/50" />
                      <input 
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-emerald-50/30 border-none text-slate-400 font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-black text-slate-500 uppercase tracking-widest ml-1">Bio / Farming Experience</label>
                  <textarea 
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about your farm or experience..."
                    rows={4}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none font-bold text-black resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    disabled={updateLoading}
                    className="flex-1 py-4 bg-[#059669] text-white rounded-full font-black text-[19px] shadow-lg shadow-emerald-100 hover:bg-[#047857] hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    {updateLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(profile);
                    }}
                    className="px-8 py-4 bg-gray-50 text-black rounded-full font-black text-[19px] hover:bg-gray-100 hover:scale-105 transition-all flex items-center justify-center gap-2 border border-gray-100"
                  >
                    <X className="w-5 h-5" /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                    <div className="space-y-1">
                      <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</p>
                      <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-100 border border-emerald-100/20 shadow-sm">
                        <User className="w-5 h-5 text-[#059669]" />
                        <span className="font-bold text-[16px] text-black">{profile.name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</p>
                      <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-100 border border-emerald-100/20 shadow-sm">
                        <Mail className="w-5 h-5 text-[#059669]" />
                        <span className="font-bold text-[16px] text-black">{profile.email}</span>
                      </div>
                    </div>
                  </div>

                {/* Farm Profile Section */}
                <div className="pt-10 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#059669] flex items-center justify-center text-white shadow-xl shadow-emerald-100/20">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-[26px] font-bold text-black tracking-tight uppercase">Farm Profile</h2>
                      <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">Personalized Agricultural Data</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-slate-100 border border-emerald-100/20 shadow-sm group hover:scale-105 transition-all">
                      <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-3">Soil Type</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors shadow-sm">
                          <Layers className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[16px] text-black">{profile.soilType || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-slate-100 border border-emerald-100/20 shadow-sm group hover:scale-105 transition-all">
                      <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-3">Land Area</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors shadow-sm">
                          <Maximize className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[16px] text-black">{profile.landArea ? `${profile.landArea} Acres` : 'Not specified'}</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-100 border border-emerald-100/20 shadow-sm group hover:scale-105 transition-all">
                      <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-3">Primary Crops</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors shadow-sm">
                          <Sprout className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[16px] text-black">{profile.primaryCrops || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="pt-10 border-t border-emerald-200">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#059669] flex items-center justify-center text-white shadow-xl shadow-emerald-100/20">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-[26px] font-bold text-black tracking-tight uppercase">Recent Activity</h2>
                        <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">Your Latest Crop Scans</p>
                      </div>
                    </div>
                    <Link to="/history" className="px-6 py-3 rounded-full bg-gray-50 text-black font-black text-[12px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-emerald-100/50">View All</Link>
                  </div>

                  <div className="space-y-4">
                    {recentScans.length > 0 ? (
                      recentScans.map((scan) => (
                        <div key={scan.id} className="flex items-center gap-5 p-5 rounded-2xl bg-slate-100 border border-emerald-100/20 shadow-sm hover:scale-[1.01] transition-all group">
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-emerald-100/20 relative shadow-sm">
                            <img 
                              src={scan.imageUrl} 
                              alt={scan.cropName} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-[20px] text-black truncate tracking-tight">{scan.cropName}</h4>
                              <div className={`w-2 h-2 rounded-full ${(scan.diagnosis?.toLowerCase() || '').includes('healthy') ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                            </div>
                            <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">
                              {scan.timestamp?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`hidden lg:flex px-4 py-2 rounded-full text-[12px] font-black uppercase tracking-widest ${
                              (scan.diagnosis?.toLowerCase() || '').includes('healthy') 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {scan.diagnosis}
                            </div>
                            <Link 
                              to={`/history?id=${scan.id}`}
                              className="px-5 py-3 rounded-full bg-gray-50 text-black font-black text-[12px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm flex items-center gap-2 border border-emerald-100/50"
                            >
                              <span className="hidden sm:inline">View Result</span>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-emerald-200">
                        <Info className="w-10 h-10 text-emerald-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-black text-[14px] uppercase tracking-widest">No recent scans found</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 mt-10">
                  <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Bio / Farming Experience</p>
                  <div className="p-8 rounded-[2.5rem] bg-white border border-emerald-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                    <p className="text-black font-medium leading-relaxed text-[17px]">
                      {profile.bio || 'No bio provided yet. Click edit to tell us about your farming journey!'}
                    </p>
                  </div>
                </div>

                </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Badges Achievement Modal */}
      <AnimatePresence>
        {showBadgesModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBadgesModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl relative z-10 border border-white/20 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/20">
                <h3 className="font-black text-2xl text-slate-900">Your Farming Journey</h3>
                <button 
                  onClick={() => setShowBadgesModal(false)}
                  className="p-2 hover:bg-slate-100/50 rounded-xl text-slate-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Badges Grid */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TIERS.map((tier) => {
                    const isUnlocked = scanCount >= tier.min;
                    const TierIcon = tier.icon;
                    
                    return (
                      <motion.div 
                        key={tier.name}
                        whileHover={isUnlocked ? { scale: 1.02 } : {}}
                        className={`p-4 rounded-2xl flex items-center gap-4 transition-all border ${
                          isUnlocked 
                            ? `${tier.color} shadow-lg` 
                            : 'bg-slate-50 border-slate-200 grayscale opacity-50'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <TierIcon className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg truncate uppercase tracking-tight">
                            {tier.name}
                          </h4>
                          <p className="text-xs font-medium opacity-80 truncate">
                            {isUnlocked ? 'Achievement Unlocked' : `Unlock at ${tier.min} scans`}
                          </p>
                        </div>
                        {isUnlocked && (
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Footer */}
              <div className="bg-emerald-50/50 p-6 border-t border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-900 font-black text-sm uppercase tracking-tight">Next Milestone</p>
                    <p className="text-emerald-700 font-bold text-xs">
                      {currentTier.next 
                        ? `You need ${currentTier.next - scanCount} more scans to reach the next rank!` 
                        : "You've reached the ultimate rank! You are an Adarsh Kisan."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md relative z-10 text-center border border-gray-50"
            >
              <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6">
                <LogOut className="w-10 h-10" />
              </div>
              <h3 className="text-[28px] font-black text-black mb-2 uppercase tracking-tight">Confirm Logout</h3>
              <p className="text-slate-500 font-medium mb-8">Are you sure you want to logout from your account?</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => logout()}
                  className="w-full py-4 bg-black text-white rounded-full font-black text-[18px] shadow-lg shadow-black/10 hover:bg-gray-900 hover:scale-105 transition-all"
                >
                  Yes, Logout
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-4 bg-gray-50 text-black rounded-full font-black text-[18px] hover:bg-gray-100 hover:scale-105 transition-all border border-gray-100"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={stopCamera}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-xl relative z-10 border border-gray-50"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-[21px] font-black text-black uppercase tracking-tight">Take Profile Photo</h3>
                <button onClick={stopCamera} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="aspect-video bg-black relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="p-8 flex flex-col items-center gap-6">
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full bg-black border-8 border-gray-100 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-xl"
                >
                  <div className="w-6 h-6 rounded-full bg-white" />
                </button>
                <p className="text-slate-500 font-black text-[12px] uppercase tracking-widest">Center your face and click to capture</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
