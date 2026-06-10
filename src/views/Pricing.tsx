import React, { useState } from 'react';
import { Check, Shield, Clock, Crown, Sparkles, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const PricingView: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoadingPlan(planId);
    setSuccessMessage(null);

    try {
      // Simulate database plan upgrade for interactive verification
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { plan: planId });
      
      setSuccessMessage(`Plan switched to ${planId.toUpperCase()} successfully! Finalizing details...`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      alert("Stripe Payment integration is being finalized. In the meantime, you can also change your plan in Account Settings!");
    } finally {
      setLoadingPlan(null);
    }
  };

  const activePlan = userProfile?.plan || 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Ideal for testing out our security engine and exploring analysis protocols.',
      features: [
        'Total of 2 documents allowed',
        'Maximum 5 pages per document',
        'Standard AI Legal Model',
        'Basic Risk & Compliance Scoring',
        'Secure Cloud Run parsing (London)'
      ],
      buttonText: 'Current Plan',
      isCurrent: activePlan === 'free',
      popular: false,
      color: 'slate'
    },
    {
      id: 'standard',
      name: 'Standard Pro',
      priceMonthly: 15,
      priceYearly: 12, // $12 x 12 = $144 (20% discount)
      description: 'Designed for legal consultants, freelancers, and small contracts.',
      features: [
        'Daily 2 documents allowed',
        'Maximum 10 pages per document',
        'Deep Forensic Risk Modeling',
        'Advanced Clause Extraction',
        'Priority execution queue',
        'Bi-lingual summary output'
      ],
      buttonText: 'Upgrade to Standard',
      isCurrent: activePlan === 'standard',
      popular: true,
      color: 'blue'
    },
    {
      id: 'premium',
      name: 'Premium Unlimited',
      priceMonthly: 49,
      priceYearly: 39, // $39 x 12 = $468 (20% discount)
      description: 'The ultimate compliance key for corporate legal teams and law firms.',
      features: [
        'Unlimited documents upload',
        'Maximum 20 pages per document',
        'Enterprise Forensic AI core',
        'Multi-lingual summary & audit',
        'Dedicated secure DB instance',
        'Custom safety policies training'
      ],
      buttonText: 'Upgrade to Premium',
      isCurrent: activePlan === 'premium',
      popular: false,
      color: 'brand'
    }
  ];

  return (
    <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 md:px-0">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-brand-secondary text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          LexiAnalyse Premium Access
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-brand-primary tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
          Unlock state-of-the-art vulnerability scanning, compliance scores, and risk tracking for all your legal instruments.
        </p>

        {/* Billing Cycles Toggle */}
        <div className="flex justify-center items-center pt-6">
          <div className="bg-slate-100 p-1.5 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-5 py-2 rounded-lg text-xs font-bold transition-all",
                billingCycle === 'monthly' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                billingCycle === 'yearly' ? "bg-brand-secondary text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Yearly Option
              <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                -20% Save
              </span>
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="max-w-md mx-auto bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center text-sm font-semibold animate-in fade-in">
          {successMessage}
        </div>
      )}

      {/* Plans Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-8">
        {plans.map((plan, idx) => {
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative bg-white rounded-2xl p-8 border-2 transition-all hover:shadow-xl flex flex-col",
                plan.isCurrent 
                  ? 'border-brand-primary shadow-lg ring-2 ring-slate-900/5' 
                  : plan.popular 
                    ? 'border-brand-secondary shadow-lg md:scale-105 z-10' 
                    : 'border-slate-200 shadow-sm'
              )}
            >
              {plan.popular && !plan.isCurrent && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-secondary text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Crown className="w-3 h-3" />
                  Most Popular
                </div>
              )}
              {plan.isCurrent && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Active Plan
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">${price}</span>
                  <span className="text-slate-400 text-sm font-semibold">/mo</span>
                </div>
                {billingCycle === 'yearly' && price > 0 && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1 uppercase tracking-wider">
                    Billed annually (${price * 12}/year)
                  </p>
                )}
                <p className="text-sm text-slate-500 mt-4 leading-relaxed min-h-[48px]">{plan.description}</p>
              </div>

              {/* Limits Spec Highlight Bar */}
              <div className="mb-6 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs font-semibold text-slate-700">
                {plan.id === 'free' && (
                  <>
                    <div>📄 Document Count: <span className="text-brand-primary font-bold">2 total</span></div>
                    <div>📏 Max Length: <span className="text-brand-primary font-bold">5 pages</span></div>
                  </>
                )}
                {plan.id === 'standard' && (
                  <>
                    <div>📅 Document Count: <span className="text-brand-primary font-bold">2 daily</span></div>
                    <div>📏 Max Length: <span className="text-brand-primary font-bold">10 pages</span></div>
                  </>
                )}
                {plan.id === 'premium' && (
                  <>
                    <div>♾️ Document Count: <span className="text-brand-primary font-bold">Unlimited</span></div>
                    <div>📏 Max Length: <span className="text-brand-primary font-bold">20 pages</span></div>
                  </>
                )}
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 p-0.5 rounded-full shrink-0",
                      plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                    )}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.isCurrent || loadingPlan !== null}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold transition-all text-sm",
                  plan.isCurrent 
                    ? 'bg-slate-50 text-slate-400 cursor-default border border-slate-200' 
                    : plan.popular 
                      ? 'bg-brand-secondary text-white hover:opacity-90 shadow-lg shadow-blue-500/20 active:scale-95' 
                      : 'border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary/5 active:scale-95'
                )}
              >
                {loadingPlan === plan.id ? 'Processing...' : plan.isCurrent ? 'Current Plan' : plan.buttonText}
              </button>
              
              {!plan.isCurrent && (
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                  <Shield className="w-3 h-3" />
                  Secure Action
                  <Clock className="w-3 h-3 ml-2" />
                  Secure simulated checkout
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Need a custom, massive compliance solution?</h2>
            <p className="text-slate-400 max-w-xl text-md leading-relaxed">
              We provide tailored limits, private secure server hosting, and high-frequency bulk endpoints for legal organizations.
            </p>
          </div>
          <a href="mailto:support@lexianalyse.com" className="whitespace-nowrap px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl">
            Contact Support
          </a>
        </div>
        <div className="absolute top-0 right-0 !w-64 !h-64 bg-slate-800 rounded-full -mr-32 -mt-32 blur-3xl opacity-35 animate-pulse" />
      </div>
    </div>
  );
};
