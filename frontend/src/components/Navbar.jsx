import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Shield, Bell, LogOut, User, MapPin, PlusCircle, LayoutDashboard, Layers } from 'lucide-react';
import '../pages/Auth.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between font-['Plus_Jakarta_Sans']">
      
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-3 group" style={{ textDecoration: 'none' }}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-600 p-[1.5px] flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-slate-950 backdrop-blur-md rounded-[9px] flex items-center justify-center">
            <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
        </div>
        <div>
          <span className="text-xl font-black text-white tracking-tight">
            JansevaX
          </span>
          <span className="block text-[9px] text-rose-400 font-bold tracking-widest uppercase">
            Smart GIS Network
          </span>
        </div>
      </Link>

      {/* Center Links */}
      <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
        <Link to="/map" className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors">
          <MapPin className="w-4 h-4 text-rose-400" /> Interactive Map
        </Link>
        <Link to="/clusters" className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors">
          <Layers className="w-4 h-4 text-purple-400" /> Issue Clusters
        </Link>
        {user?.role === 'CITIZEN' && (
          <Link to="/report" className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95 rounded-lg flex items-center gap-2 shadow-md shadow-rose-500/20 transition-all">
            <PlusCircle className="w-4 h-4 text-white" /> Report Problem
          </Link>
        )}
      </nav>

      {/* Right User Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Notification Bell (Officers Only) */}
            {(user.role === 'DEPARTMENT_OFFICER' || user.role === 'ADMIN') && (
              <Link to="/notifications" className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Dashboard Link */}
            <Link
              to={user.role === 'ADMIN' ? '/admin' : user.role === 'DEPARTMENT_OFFICER' ? '/department' : '/dashboard'}
              className="px-3.5 py-2 text-xs font-bold text-white bg-white/[0.06] border border-white/10 hover:bg-white/10 rounded-xl flex items-center gap-2 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-rose-400" />
              Dashboard
            </Link>

            {/* User Profile dropdown/info */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-bold text-white">{user.name}</span>
                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  user.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  user.role === 'DEPARTMENT_OFFICER' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95 shadow-lg shadow-rose-500/25 rounded-xl transition-all">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
