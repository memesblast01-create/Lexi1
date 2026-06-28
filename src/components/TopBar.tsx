import React, { useState } from 'react';
import { Search, Bell, LogIn, LogOut, Menu, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../lib/firebase';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onMenuClick }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; title: string; body: string; time: string; read: boolean }[]>([]);

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-260px)] h-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-slate-500 lg:hidden hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <span className="text-base md:text-lg font-bold text-[#1A2B3C] truncate">{title}</span>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <div className="relative hidden xl:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-brand-secondary/20 transition-all outline-none"
            placeholder="Search documents..."
            type="text"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-500 hover:text-brand-secondary transition-colors relative p-1 flex items-center"
          >
            <Bell className="w-5 h-5 md:w-6 h-6" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1 animate-in fade-in duration-200">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Notifications</span>
                <button 
                  onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                  className="text-[9px] font-bold text-brand-secondary hover:underline uppercase tracking-wide"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium">No recent notifications.</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => setNotifications(notifications.map(item => item.id === n.id ? {...item, read: true} : item))}
                      className={cn(
                        "p-3.5 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors text-left",
                        !n.read && "bg-blue-50/20"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className={cn("text-xs font-bold text-slate-700", !n.read && "text-brand-primary font-extrabold")}>{n.title}</span>
                        <span className="text-[8px] text-slate-400 font-bold whitespace-nowrap pl-2">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-1.5 bg-slate-50 text-center border-t border-slate-100">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-[9px] text-slate-400 font-bold hover:text-slate-600 block w-full uppercase tracking-wider"
                >
                  Dismiss Panel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-4 border-l border-slate-200">
          {!loading && user ? (
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] md:text-xs font-bold text-on-surface truncate max-w-[100px]">{user.displayName || 'Legal Pro'}</p>
                <p className="text-[8px] md:text-[10px] text-slate-500 truncate max-w-[100px]">{user.email}</p>
              </div>
              <div className="w-7 h-7 md:w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50 text-slate-400">
                <UserIcon className="w-4 h-4 md:w-5 h-5" />
              </div>
              <button 
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-error transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              disabled={loading}
              className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-brand-secondary text-white rounded-lg text-[10px] md:text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-4 h-4 hidden xs:block" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
