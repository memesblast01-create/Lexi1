import React, { useState, useRef } from 'react';
import { 
  CloudUpload, 
  Settings2, 
  Languages, 
  Zap, 
  Lock, 
  Info, 
  ArrowRight,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { analyzeDocument } from '../services/geminiService';
import { DocumentType } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

export const UploadView: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>('Contract');
  const [language, setLanguage] = useState('English');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!user) {
      setError("Please sign in to analyze documents.");
      return;
    }
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const activePlan = userProfile?.plan || 'free';
    const usageCount = userProfile?.usageCount || 0;

    // Strict secure checking for Document Limits
    if (activePlan === 'free' && usageCount >= 2) {
      setError("Quota Exceeded. The Free Plan is strictly limited to 2 total document analyses. Please upgrade to a Pro plan in Settings or Pricing to unlock more analyses.");
      return;
    }

    if (activePlan === 'standard' && usageCount >= 2) {
      setError("Daily Quota Exceeded. Under the Standard Pro Plan, you are allowed up to 2 documents daily. Upgrade to Premium in Settings or Pricing to analyze unlimited daily documents.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Max limit is 10MB.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      
      const contentPromise = new Promise<string | { data: string; mimeType: string }>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
            const base64 = result.split(',')[1];
            resolve({ data: base64, mimeType: file.type });
          } else {
            resolve(result);
          }
        };
        reader.onerror = reject;
        
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });

      const startTime = Date.now();
      const content = await contentPromise;
      const analysis = await analyzeDocument(content, docType, language);
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      // Save to Firestore
      const analysisData = {
        userId: user.uid,
        docName: file.name,
        docType: docType,
        result: analysis,
        createdAt: serverTimestamp()
      };

      const analysesRef = collection(db, 'users', user.uid, 'analyses');
      await addDoc(analysesRef, analysisData);

      // Update usage count
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        usageCount: increment(1)
      });
      
      navigate('/results', { state: { analysis, docName: file.name, docType, rawContent: content, elapsedTime } });
    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze document. Please check your API key or file format.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-brand-primary">Upload Document</h1>
        <p className="text-slate-500 mt-2">Securely upload and configure your documents for deep semantic analysis.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Upload Area */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl p-8 h-full shadow-sm">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 bg-surface-low rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors hover:border-brand-secondary group cursor-pointer h-full min-h-[400px]"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt,image/*"
              />
              
              <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 text-brand-secondary group-hover:scale-110 transition-transform">
                <CloudUpload className="w-10 h-10" />
              </div>
              
              {file ? (
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-brand-primary">{file.name}</h2>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button className="text-brand-secondary text-xs font-bold uppercase hover:underline">Change File</button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-brand-primary mb-2">Drag and drop your file here</h2>
                  <p className="text-sm text-slate-500 mb-8 max-w-md">
                    Supported formats: PDF, DOCX, and high-res images (JPEG/PNG). Multi-file upload supported for batch processing.
                  </p>
                  <div className="flex items-center justify-center">
                    <button className="bg-brand-secondary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">Select Files</button>
                  </div>
                </>
              )}

              <div className="mt-12 flex items-center justify-center border-t border-slate-200/50 pt-8 w-full max-w-xl">
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">End-to-End Encrypted</span>
                </div>
              </div>
            </div>
            
            {error && (
              <p className="mt-4 text-error text-center text-sm font-bold bg-error-container/50 py-2 rounded-lg">{error}</p>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-brand-primary">
              <Settings2 className="w-5 h-5" />
              <h3 className="font-bold text-lg">Document Profile</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Document Type</label>
                <select 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentType)}
                  className="w-full bg-white border border-slate-200 rounded-lg h-12 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                >
                  <option>Contract</option>
                  <option>Legal Document</option>
                  <option>Business Agreement</option>
                  <option>Invoice</option>
                  <option>Government Form</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Processing Language</label>
                <div className="relative">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg h-12 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  >
                    <option>English</option>
                    <option>Arabic</option>
                    <option>Urdu</option>
                    <option>Hindi</option>
                    <option>Bengali</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Spanish</option>
                    <option>Portuguese</option>
                    <option>Russian</option>
                    <option>Japanese</option>
                    <option>Chinese</option>
                    <option>Italian</option>
                    <option>Dutch</option>
                    <option>Turkish</option>
                    <option>Persian</option>
                  </select>
                  <Languages className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-5 h-5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Analysis Intensity</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button className="bg-surface-low border-2 border-brand-secondary text-brand-primary rounded-lg py-2 text-xs font-bold">Standard</button>
                  <button className="bg-white border border-slate-200 text-slate-500 rounded-lg py-2 text-xs font-bold hover:bg-slate-50">Deep Forensic</button>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                  <strong>Standard:</strong> Rapid audit covering basic responsibilities, payment structures, and dates. <br/>
                  <strong>Deep Forensic:</strong> Exhaustive multi-pass compliance check detecting hidden pitfalls, regulatory breaches, and complex liabilities.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary text-white rounded-xl p-6 relative overflow-hidden shadow-md">
            <h4 className="text-lg font-bold mb-4">
              {userProfile?.plan === 'premium' ? 'Premium Quota' : userProfile?.plan === 'standard' ? 'Standard Pro Quota' : 'Free Quota'}
            </h4>
            <div className="space-y-4 relative z-10 w-full">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-bold">Plan Restrictions</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {userProfile?.plan === 'premium' 
                      ? 'No daily document limit.' 
                      : userProfile?.plan === 'standard' 
                        ? 'Allowed 2 daily documents.' 
                        : 'Allowed 2 total documents.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Current Consumed</span>
                  <span className="font-bold text-white">
                    {userProfile?.plan === 'premium' 
                      ? `${userProfile?.usageCount || 0} analyses` 
                      : `${userProfile?.usageCount || 0} / 2`}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Remaining Limit</span>
                  <span className="font-bold text-emerald-400">
                    {userProfile?.plan === 'premium' 
                      ? 'No Limit' 
                      : `${Math.max(2 - (userProfile?.usageCount || 0), 0)} left`}
                  </span>
                </div>

                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500" 
                    style={{ 
                      width: `${
                        userProfile?.plan === 'premium' 
                          ? 100 
                          : Math.min(((userProfile?.usageCount || 0) / 2) * 100, 100)
                      }%` 
                    }}
                  />
                </div>
              </div>

              {userProfile?.plan !== 'premium' && (
                <button 
                  onClick={() => navigate('/pricing')}
                  className="w-full mt-4 bg-white text-brand-primary hover:bg-slate-100 py-3 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  Upgrade Plan to Premium
                </button>
              )}
            </div>
            <Info className="absolute top-0 right-0 !w-16 !h-16 text-white/5 -mr-4 -mt-4" />
          </div>

          <button 
            disabled={isAnalyzing || !file}
            onClick={handleUpload}
            className="w-full bg-brand-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform active:scale-100 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isAnalyzing ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Analyzing...
              </>
            ) : (
              <>
                Process Analysis
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
