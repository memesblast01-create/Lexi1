import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  UploadCloud, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Plus,
  ExternalLink,
  ShieldCheck,
  FileText,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const analysesRef = collection(db, 'users', user.uid, 'analyses');
    
    // We remove the date filter for now to avoid indexing issues unless configured
    const q = query(
      analysesRef, 
      orderBy('createdAt', 'desc'), 
      limit(5)
    );

    const unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentAnalyses(data);
        setLoading(false);
      },
      error: (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load recent analyses. " + (err.message.includes('index') ? "A Firestore index is required for this query." : ""));
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const getRiskColor = (score: string) => {
    switch (score) {
      case 'Safe': return 'text-emerald-700 bg-emerald-50';
      case 'Moderate Risk': return 'text-amber-700 bg-amber-50';
      case 'High Risk': return 'text-error bg-error-container';
      default: return 'text-slate-700 bg-slate-50';
    }
  };

  const pendingTasks = recentAnalyses.filter(
    (doc) => doc.result?.verdict?.score === 'High Risk' || doc.result?.verdict?.score === 'Moderate Risk'
  );

  if (authLoading) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-12 gap-8">
        {/* Main Hero / Action Card */}
        <div className="col-span-12 lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/documents')}
            className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden h-[340px] flex flex-col justify-center items-center text-center group cursor-pointer hover:border-brand-secondary transition-colors"
          >
            <div className="absolute inset-0 bg-slate-50/50 -z-10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            
            <div className="mb-6 w-20 h-20 bg-surface-highest rounded-2xl flex items-center justify-center text-brand-secondary shadow-lg shadow-brand-secondary/20 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-10 h-10" />
            </div>
            
            <h2 className="text-3xl font-bold text-on-surface mb-3">New Analysis</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
              Drag and drop your legal documents, financial reports, or contracts here to start a deep intelligence scan.
            </p>
            
            <div className="flex space-x-4">
              <NavLink 
                to="/documents"
                className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Browse Files
              </NavLink>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Cards */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-brand-primary text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-xs font-bold tracking-widest text-[#8192a7] mb-4 uppercase">System Performance</h3>
            <div className="flex items-end justify-between relative z-10">
              <div>
                <p className="text-4xl font-black mb-1">98.4%</p>
                <p className="text-xs text-slate-400">OCR Accuracy Rating</p>
              </div>
              <BarChart3 className="text-emerald-400 w-10 h-10" />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-4">Needs Your Attention</h3>
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-slate-500">Nothing needs review right now.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((doc) => {
                  const isHighRisk = doc.result.verdict.score === 'High Risk';
                  return (
                    <div
                      key={doc.id}
                      onClick={() => navigate('/results', { state: { analysis: doc.result, docName: doc.docName, docType: doc.docType } })}
                      className="flex items-center group cursor-pointer"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mr-4",
                        isHighRisk ? "bg-red-50 text-error" : "bg-amber-50 text-amber-600"
                      )}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{isHighRisk ? 'High Risk — Review' : 'Moderate Risk — Worth a look'}</p>
                        <p className="text-[10px] text-slate-500 truncate">{doc.docName}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-on-surface">Recent Analyses</h2>
          {user && (
            <NavLink to="/documents" className="text-brand-secondary font-bold text-sm hover:underline flex items-center">
              View All History
              <ArrowRight className="w-4 h-4 ml-1" />
            </NavLink>
          )}
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm min-h-[300px] flex flex-col">
          {error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-error mb-4" />
              <p className="text-error font-medium">{error}</p>
            </div>
          ) : !user ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <Lock className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Please sign in to view your analysis history.</p>
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center p-12">
               <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-8 h-8 border-4 border-brand-secondary border-t-transparent rounded-full"
                />
            </div>
          ) : recentAnalyses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No analyses found. Start your first scan!</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Document Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Document Type</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Risk Score</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAnalyses.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-slate-400 mr-3" />
                        <span className="font-semibold text-sm">{doc.docName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-600">{doc.docType}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-600">
                        {doc.createdAt?.toDate().toLocaleDateString() || 'Just now'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className={cn("flex items-center px-3 py-1 rounded-full w-fit", getRiskColor(doc.result.verdict.score))}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{doc.result.verdict.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => navigate('/results', { state: { analysis: doc.result, docName: doc.docName, docType: doc.docType } })}
                        className="p-2 text-slate-400 hover:text-brand-secondary hover:bg-brand-secondary/10 rounded-lg transition-all"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};
