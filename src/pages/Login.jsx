import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, Mail, Lock, ArrowRight, Github, 
  Chrome, ShieldCheck, Eye, EyeOff, Sparkles,
  ChevronLeft, Fingerprint, Activity, Smartphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
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
        sessionStorage.setItem('accessToken', data.accessToken);
        const userData = { ...data.user, refreshToken: data.refreshToken, role: data.user.role };
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Verification failed. Access denied.');
      }
    } catch (err) {
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/auth/google-login', {
        method: 'POST',
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('accessToken', data.accessToken);
        const userData = { ...data.user, refreshToken: data.refreshToken, role: data.user.role };
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Google login failed.');
      }
    } catch (err) {
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12 relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] dark:bg-primary/5" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[120px] dark:bg-secondary/5" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10"
      >
        {/* Visual Panel */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,_rgba(59,130,246,0.3),transparent_70%)]" />
          </div>
          
          <div className="z-10">
            <Link to="/" className="flex items-center gap-3 no-underline group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                <Smartphone size={20} />
              </div>
              <span className="text-2xl font-black text-white italic tracking-tighter">FinderHub.</span>
            </Link>
          </div>

          <div className="z-10">
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Welcome Back to <br />
              <span className="text-primary italic">FinderHub.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
              The safest place to find what you've lost and return what you've found.
            </p>
          </div>

          <div className="z-10 flex gap-4 pt-8">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex-1">
              <div className="text-primary mb-2"><ShieldCheck size={20} /></div>
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Secure Access</p>
              <p className="text-xs font-bold text-white">Encrypted Sessions</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex-1">
              <div className="text-primary mb-2"><Activity size={20} /></div>
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Live Updates</p>
              <p className="text-xs font-bold text-white">Real-time Tracking</p>
            </div>
          </div>
        </div>

        {/* Input Panel */}
        <div className="p-10 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Sign In</h1>
            <p className="text-slate-500 font-bold text-sm">Enter your credentials to continue</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 font-bold text-sm"
              >
                <ShieldCheck size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white font-bold text-base focus:bg-white dark:focus:bg-slate-700/50 focus:border-primary/50 transition-all outline-none"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                <a href="#" className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline transition-all">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-12 text-slate-900 dark:text-white font-bold text-base focus:bg-white dark:focus:bg-slate-700/50 focus:border-primary/50 transition-all outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-4 rounded-2xl text-lg flex justify-center items-center gap-2 group transition-all"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <span className="relative px-4 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Or continue with</span>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="filled_blue"
                shape="pill"
                size="large"
                width="100%"
              />
            </div>

  
            
            <p className="mt-10 text-center text-slate-500 font-bold text-sm">
              Don't have an account? {' '}
              <Link to="/signup" className="text-primary font-black hover:text-primary-dark transition-colors underline underline-offset-4">Sign Up</Link>
            </p>
            <p className="mt-4 text-center">
              <Link to="/admin/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all no-underline">Login as Administrator</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
