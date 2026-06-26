import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  User as UserIcon, 
  FileText, 
  CloudLightning, 
  Layers, 
  HelpCircle,
  FileCheck2,
  LockKeyhole,
  UploadCloud,
  Check
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setNeedsVerification(true);
          setError("Verification Required. We have sent a confirmation link to your inbox. Please verify first.");
        } else {
          navigate('/');
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters for strict institutional security.");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Professional naming automatically generated from email
        const namePart = email.split('@')[0];
        const displayName = namePart
          .split(/[._-]/)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

        await updateProfile(userCredential.user, { displayName });
        await sendEmailVerification(userCredential.user);
        
        setSuccessMessage("Secure profile initialized. An activation link has been sent to your email.");
        setIsLogin(true);
        setNeedsVerification(true);
      }
    } catch (err: any) {
      console.error("Auth failure:", err);
      let message = err.message;
      if (err.code === 'auth/user-not-found') message = "Authentication identity record not verified.";
      if (err.code === 'auth/wrong-password') message = "Invalid credentials. Secure sign-in denied.";
      if (err.code === 'auth/email-already-in-use') message = "This email address is already associated with an account.";
      if (err.code === 'auth/invalid-credential') message = "Invalid credentials. Please verify your details.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
      setError("Please sign in to request a fresh link.");
      setNeedsVerification(false);
      return;
    }
    
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setSuccessMessage("A fresh verification link has been dispatched to your email address.");
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const supportedDocuments = [
    { title: "Employment Contract", desc: "Analyzes salary structures, IP transfer clauses, non-competes, and notice terminations." },
    { title: "Offer Letter", desc: "Validates compensation schedules, probationary thresholds, and stock vesting policies." },
    { title: "NDA (Non-Disclosure)", desc: "Tracks definition of confidential values, exclusion items, and survival timelines." },
    { title: "Freelance Agreement", desc: "Verifies payment terms, milestones, copyright protections, and liability limits." },
    { title: "Vendor Agreement", desc: "Reviews SLAs, indemnification structures, breach policies, and payment terms." },
    { title: "Service Agreement", desc: "Audits statements of work, change order rules, warranties, and force majeure." },
    { title: "Lease Agreement", desc: "Confirms rental escalations, security deposit terms, maintenance bills, and sublease rights." },
    { title: "Loan Agreement", desc: "Validates compound interest rates, default penalties, maturity timelines, and collateral clauses." },
    { title: "SaaS Agreement", desc: "Tracks subscription models, usage caps, uptime guarantees, data processor security, and GDPR." },
    { title: "Shareholder Agreement", desc: "Audits preemption rights, drag-along, tag-along formulas, and board appointments." },
    { title: "Founder Agreement", desc: "Validates equity splits, vesting schedules, IP contribution, and decision-making weights." },
    { title: "Insurance Policy", desc: "Verifies deductible policies, covered exclusions, claim schedules, and notice duties." },
    { title: "Terms & Conditions", desc: "Reviews platform liabilities, user restrictions, billing cycles, and arbitration overrides." },
    { title: "Privacy Policy", desc: "Ensures compliance with GDPR, CCPA, cookie consents, third-party trackers, and data storage." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 xl:max-w-7xl xl:mx-auto">
      {/* Visual Brand Header */}
      <div className="w-full flex justify-between items-center mb-10 max-w-6xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">L</div>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight">LexiAnalyse <span className="text-brand-secondary">Pro</span></span>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Supported Document Types Catalog & Demo Uplod Box (Informational) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              AI Legal Document <br />
              <span className="text-brand-secondary">Risk Scanner</span>
            </h1>
            <p className="text-slate-500 max-w-xl text-md leading-relaxed">
              LexiAnalyse automatically extracts liability, safety levels, and risk indicators from complex legal documents. Sign up to get started.
            </p>
          </div>

          {/* Secure Upload Simulator (Informational Preview Window) */}
          <div className="bg-white border-2 border-dashed border-slate-200 hover:border-brand-secondary transition-colors rounded-2xl p-6 relative overflow-hidden shadow-sm group">
            <div className="flex flex-col items-center text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-brand-secondary rounded-full flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Document Preview</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-sm">
                  Sign in or create an account to start processing files.
                </p>
              </div>
              <div className="inline-flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System status: online
              </div>
            </div>
            {/* Corner Decorative Lock Tag */}
            <div className="absolute top-3 right-3 text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <LockKeyhole className="w-3 h-3 text-slate-400" />
              ReadOnly
            </div>
          </div>

          {/* Document Type Badges List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-secondary" />
              Supported Document Standards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {supportedDocuments.map((doc, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-slate-100 p-3 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all flex gap-3"
                >
                  <div className="w-7 h-7 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-brand-secondary shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight">{doc.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                      {doc.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Secure Authenticator Box */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 p-8 md:p-10 relative">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isLogin ? 'Sign in to LexiAnalyse' : 'Create your account'}
            </h2>
            <p className="text-slate-400 text-xs mt-1.5">
              {isLogin ? 'Enter your credentials to continue' : 'Create your account to get started'}
            </p>
          </div>

          {needsVerification ? (
            <div className="text-center space-y-6">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-brand-secondary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-md">Activate your profile</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  We have dispatched a verification link to <span className="font-bold text-slate-800">{email}</span>. Click it to unlock your analysis workspace.
                </p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setNeedsVerification(false)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Return to Sign In <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-xs disabled:opacity-50"
                >
                  {loading ? 'Sending...' : "Didn't receive it? Resend link"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleEmailAuth} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-brand-secondary transition-all text-sm text-slate-900 placeholder:text-slate-400"
                      placeholder="e.g. counsel@institution.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-brand-secondary transition-all text-sm text-slate-900 placeholder:text-slate-400"
                      placeholder="Min. 8 secure characters"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-brand-secondary transition-all text-sm text-slate-900 placeholder:text-slate-400"
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                  </div>
                )}

                <button 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex items-center py-2 my-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-3 text-slate-300 text-[10px] font-bold uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <button 
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-700"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4.5 h-4.5" alt="Google" />
                Sign in with Google
              </button>

              {(error || successMessage) && (
                <div className={cn(
                  "p-4 rounded-xl flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-top-1 text-xs",
                  error ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                )}>
                  {error ? <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />}
                  <p className="font-semibold leading-relaxed">{error || successMessage}</p>
                </div>
              )}

              <p className="text-center text-xs text-slate-500 font-semibold mt-6">
                {isLogin ? "Don't have an authentication profile?" : "Already registered?"}
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-brand-secondary font-extrabold ml-1 hover:underline decoration-2 underline-offset-4"
                >
                  {isLogin ? 'Create Profile' : 'Sign In'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
