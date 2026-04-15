import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  db, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  serverTimestamp,
  OperationType,
  handleFirestoreError,
  clearFirestorePersistence
} from '../lib/firebase';
import { GoogleGenAI } from "@google/genai";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: any;
}

const ExpertAdvisor: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'consultations'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      // Sort in memory to avoid index requirement
      msgs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeA - timeB;
      });
      setMessages(msgs);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'consultations');
    });

    return () => unsubscribe();
  }, [user]);

  const handleSend = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !user || isLoading) return;

    const userMessage = input.trim();
    
    // 1. Immediately update local state for better UX
    const tempId = `temp-${Date.now()}`;
    const tempUserMsg: Message = {
      id: tempId,
      text: userMessage,
      sender: user.email || 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    
    // 2. Clear input immediately
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // 3. Save user message to Firestore (Graceful failure)
      try {
        const userDoc = {
          userId: String(user.uid),
          text: String(userMessage),
          sender: String(user.email || 'user'),
          timestamp: serverTimestamp()
        };
        await addDoc(collection(db, 'consultations'), userDoc);
      } catch (dbErr) {
        console.warn("Firestore failed to save user message, continuing with AI call...", dbErr);
      }

      // 4. Get AI response
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setError('API Key missing. Please check your environment variables.');
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Timeout logic (10 seconds)
      const fetchWithTimeout = async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: userMessage,
          config: {
            systemInstruction: "You are an AI Agricultural Expert for Agro-Nexus. Provide concise, professional advice on crops, soil, and market trends in India.",
          },
        });
        return response;
      };

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      const response: any = await Promise.race([fetchWithTimeout(), timeoutPromise]);
      const aiText = response.text || "I'm sorry, I couldn't generate a response at this time.";

      // 5. Update local state with AI response immediately (UI Stability)
      const aiTempId = `ai-temp-${Date.now()}`;
      const tempAiMsg: Message = {
        id: aiTempId,
        text: aiText,
        sender: 'Agro-Nexus AI',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tempAiMsg]);

      // 6. Save AI response to Firestore (Graceful failure)
      try {
        const aiDoc = {
          userId: String(user.uid),
          text: String(aiText),
          sender: 'Agro-Nexus AI',
          timestamp: serverTimestamp()
        };
        await addDoc(collection(db, 'consultations'), aiDoc);
      } catch (dbErr) {
        console.warn("Firestore failed to save AI response, but UI is updated.", dbErr);
      }

    } catch (err: any) {
      console.error("DEBUG CHAT ERROR:", err);
      if (err.message === 'Timeout') {
        setError("Server is busy. Please try again later.");
      } else {
        setError(`Failed to get response: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
              Please log in to chat with our agricultural experts.
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
    <div className="flex flex-col h-[calc(100vh-80px)] bg-forest-light mb-24">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 p-2 md:p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-emerald-50 rounded-xl transition-colors text-emerald-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-900/20">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-emerald-900 tracking-tight">Expert Consultation</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Agricultural Scientist Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
            <Sparkles className="w-12 h-12 text-emerald-600" />
            <p className="text-emerald-900 font-bold max-w-xs">
              Start a professional consultation about crops, soil, or market trends. Our scientists are here to help.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender !== 'Agro-Nexus AI';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                  <span className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest mb-1 px-1">
                    {isUser ? 'You' : 'Agro-Nexus AI'}
                  </span>
                  <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isUser ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-emerald-100'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      isUser 
                        ? 'bg-emerald-900 text-white rounded-tr-none' 
                        : 'bg-white text-emerald-900 border border-emerald-100 rounded-tl-none'
                    }`}>
                      <div className={`markdown-body text-sm leading-relaxed ${isUser ? 'text-white' : 'text-emerald-900'}`}>
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-emerald-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span className="text-sm font-bold text-emerald-900/40 animate-pulse">Scientist is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3">
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
            <button
              onClick={clearFirestorePersistence}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-900 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Connection
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white border-t border-emerald-100">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your agricultural query here..."
            className="w-full pl-6 pr-16 py-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            disabled={isLoading}
          />
          <button
            type="submit"
            onClick={(e) => handleSend(e)}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-emerald-900 text-emerald-400 rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-center text-[10px] text-emerald-900/30 font-bold uppercase tracking-widest mt-4">
          Agro-Nexus AI can provide guidance but always verify with local authorities.
        </p>
      </div>
    </div>
  );
};

export default ExpertAdvisor;
