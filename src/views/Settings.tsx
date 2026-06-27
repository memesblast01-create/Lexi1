import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  Check, 
  TrendingUp, 
  Zap, 
  Sliders, 
  CreditCard,
  CloudLightning,
  Trash2,
  Calendar,
  Lock,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, updateEmail, deleteUser } from 'firebase/auth';
import { auth, db, logout, resetPassword } from '../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const SettingsView: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    setResetMsg('');
    try {
      await resetPassword(user.email);
      setResetMsg('Reset link sent to your email.');
    } catch (err) {
      setResetMsg('Could not send reset email. Try again later.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid));
      await deleteUser(auth.currentUser);
      navigate('/login');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError('For security, please log out and log back in, then try deleting your account again.');
      } else {
        setDeleteError('Could not delete account. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };
  const [errorMsg, setErrorMsg] = useState('');
  
  // Local state for plan selection simulation to let users test security limits
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmailInput(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      // 1. Update display name in Firebase Auth
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      // 2. Update email in Firebase Auth
      if (emailInput && emailInput !== user.email) {
        try {
          await updateEmail(user, emailInput);
        } catch (authErr: any) {
          if (authErr.code === 'auth/requires-recent-login' || authErr.message?.includes('recent login')) {
            throw new Error("For security, updating your account email requires recent authentication. Please sign out, sign back in, and try again.");
          }
          throw authErr;
        }
      }

      // 3. Update database users collections
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        displayName,
        email: emailInput
      });

      setSuccessMsg("Account profile details updated successfully.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to edit user credentials.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSimulatePlanChange = async (newPlan: string) => {
    if (!user) return;
    setLoadingPlan(newPlan);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { plan: newPlan });
      setSuccessMsg(`Subscription successfully shifted to ${newPlan.toUpperCase()} Plan. Reloading...`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setErrorMsg("Failed to switch simulated subscription.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const activePlan = userProfile?.plan || 'free';

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-2">Manage your analysis credentials, subscription plans, and enterprise configurations.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Settings Navigation / Info column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 truncate max-w-[180px]">{user?.displayName || 'Legal Professional'}</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase">{activePlan} account</p>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Joined {userProfile?.createdAt?.toDate().toLocaleDateString() || 'Recently'}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-xl" />
            <h4 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Enterprise Guard</h4>
            <div className="space-y-3 relative z-10 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>End-to-End File Encryption active</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Firebase Authentication active</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Server Region: Secure Cloud Run London</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panels */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Messages */}
          {(successMsg || errorMsg) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-lg flex items-start gap-3 border",
                errorMsg ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"
              )}
            >
              {errorMsg ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <Check className="w-5 h-5 shrink-0" />}
              <span className="text-sm font-semibold">{errorMsg || successMsg}</span>
            </motion.div>
          )}

          {/* Account Profile Editor */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sliders className="w-5 h-5 text-brand-secondary" />
              <h2 className="text-xl font-bold text-slate-900">Personal Details</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 font-medium"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 font-medium"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-3 bg-brand-secondary text-white rounded-lg font-bold hover:opacity-90 transition-all text-sm shadow-md"
                >
                  {isUpdating ? 'Saving...' : 'Update Information'}
                </button>
              </div>
            </form>
          </div>

          {/* Premium Subscription Management Panel */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-brand-secondary" />
                <h2 className="text-xl font-bold text-slate-900">Subscription & Quota Plan</h2>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-brand-secondary text-xs font-bold uppercase rounded-full">
                {activePlan} plan active
              </span>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-md font-bold text-slate-900 uppercase">
                    {activePlan === 'free' ? 'Free Plan' : activePlan === 'standard' ? 'Standard Pro Plan' : 'Premium Unlimited Plan'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {activePlan === 'free' && 'Allows up to 2 total document analyses. Maximum document length: 5 pages.'}
                    {activePlan === 'standard' && 'Allows up to 2 daily documents analyses. Maximum document length: 10 pages.'}
                    {activePlan === 'premium' && 'Allows Unlimited documents analyses. Maximum document length: 20 pages.'}
                  </p>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">
                    {activePlan === 'free' && '$0'}
                    {activePlan === 'standard' && '$15'}
                    {activePlan === 'premium' && '$49'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/mo</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Simulate Subscription (Testing Environment)</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  LexiAnalyse utilizes Stripe payments. You can switch plans instantly below to test how our security core enforces file, page, and usage restrictions across various levels.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleSimulatePlanChange('free')}
                    disabled={activePlan === 'free' || loadingPlan !== null}
                    className={cn(
                      "py-3 rounded-lg font-bold border text-xs transition-all flex items-center justify-center gap-2",
                      activePlan === 'free' 
                        ? 'bg-blue-50 border-blue-200 text-brand-secondary cursor-default' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {activePlan === 'free' && <Check className="w-4 h-4" />}
                    Simulate Free
                  </button>

                  <button
                    onClick={() => handleSimulatePlanChange('standard')}
                    disabled={activePlan === 'standard' || loadingPlan !== null}
                    className={cn(
                      "py-3 rounded-lg font-bold border text-xs transition-all flex items-center justify-center gap-2",
                      activePlan === 'standard' 
                        ? 'bg-blue-50 border-blue-200 text-brand-secondary cursor-default' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {activePlan === 'standard' && <Check className="w-4 h-4" />}
                    Simulate Standard ($15/mo)
                  </button>

                  <button
                    onClick={() => handleSimulatePlanChange('premium')}
                    disabled={activePlan === 'premium' || loadingPlan !== null}
                    className={cn(
                      "py-3 rounded-lg font-bold border text-xs transition-all flex items-center justify-center gap-2",
                      activePlan === 'premium' 
                        ? 'bg-blue-50 border-blue-200 text-brand-secondary cursor-default' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {activePlan === 'premium' && <Check className="w-4 h-4" />}
                    Simulate Premium ($49/mo)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-8">
            <h3 className="font-bold text-slate-900 mb-1">Account Actions</h3>
            <p className="text-slate-400 text-xs mb-5">Manage your sign-in and account.</p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={isSendingReset}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-left disabled:opacity-60"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <Lock className="w-4 h-4 text-slate-400" />
                  Change password
                </span>
                <span className="text-xs text-slate-400">{isSendingReset ? 'Sending...' : 'Send reset email'}</span>
              </button>
              {resetMsg && <p className="text-xs text-emerald-600 px-1">{resetMsg}</p>}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-left"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <Key className="w-4 h-4 text-slate-400" />
                  Log out
                </span>
              </button>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all text-left"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-red-600">
                    <Trash2 className="w-4 h-4" />
                    Delete account
                  </span>
                </button>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                  <p className="text-sm font-medium text-red-700">This permanently deletes your account and all your analyses. This cannot be undone.</p>
                  {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-60"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
