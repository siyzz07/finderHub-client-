import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Mail, Lock, ArrowRight, Shield, 
  Eye, EyeOff, Globe, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role !== 'admin') {
          setError('Restricted: Admin privileges required.');
          setLoading(false);
          return;
        }
        
        sessionStorage.setItem('accessToken', data.accessToken);
        const userData = { ...data.user, refreshToken: data.refreshToken, role: data.user.role };
        sessionStorage.setItem('user', JSON.stringify(userData));
        navigate('/admin');
      } else {
        setError(data.message || 'Verification failed.');
      }
    } catch (err) {
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#020617] px-6 py-12 relative overflow-hidden transition-colors duration-500">
      {/* Background Polish */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[5%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px] relative z-10"
      >
        <div className="text-center mb-10">
            <Link to="/" className="inline-flex flex-col items-center gap-4 no-underline group">
              <div className="w-16 h-16 bg-white dark:bg-[#1e293b] rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-blue-500/10 border border-slate-100 dark:border-slate-800 transition-transform group-hover:scale-110">
                <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Admin <span className="text-primary italic">Portal.</span></h1>
            </Link>
        </div>

        <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
          <div className="mb-10 text-center">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                <Globe size={14} /> Restricted Area
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 font-bold text-sm"
              >
                <Shield size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Email Authority</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="email" 
                  className="w-full bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-slate-900 dark:text-white font-bold text-base focus:bg-white dark:focus:bg-white/5 focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="admin@finderhub.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Security Token</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="w-full bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-12 text-slate-900 dark:text-white font-bold text-base focus:bg-white dark:focus:bg-white/5 focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-primary transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-lg font-black italic flex justify-center items-center gap-3 group transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-white/10 border-none cursor-pointer"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Grant Access <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800/50 text-center">
            <button 
              type="button"
              onClick={() => { setEmail('admin123@gmail.com'); setPassword('1234567'); }}
              className="px-6 py-2 rounded-xl bg-primary/5 dark:bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all border-none cursor-pointer flex items-center gap-2 mx-auto"
            >
              <Sparkles size={12} /> Auto-fill Demo Access
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-400 dark:text-slate-500 font-bold text-sm">
          System integrity: <span className="text-emerald-500">Active</span> • <Link to="/login" className="text-slate-900 dark:text-white font-black hover:text-primary transition-colors underline underline-offset-4">Return</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
