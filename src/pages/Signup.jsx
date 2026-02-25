import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Mail, Lock, User, ArrowRight, Github, 
  Chrome, ShieldCheck, Eye, EyeOff, Sparkles,
  ChevronLeft, Fingerprint, ShieldAlert, Cpu, Smartphone, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match. Please try again.');
    }

    if (formData.password.length < 6) {
        return setError('Password must be at least 6 characters long.');
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('accessToken', data.accessToken);
        const userData = { ...data.user, refreshToken: data.refreshToken, role: 'user' };
        sessionStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
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
        const userData = { ...data.user, refreshToken: data.refreshToken, role: 'user' };
        sessionStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
      } else {
        setError(data.message || 'Google registration failed.');
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
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[120px] dark:bg-secondary/5" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] dark:bg-primary/5" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-5 bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10"
      >
        {/* Visual Sidebar */}
        <div className="hidden lg:flex lg:col-span-2 flex-col justify-between p-16 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,_rgba(139,92,246,0.3),transparent_70%)]" />
          </div>

          <div className="z-10">
            <Link to="/" className="flex items-center gap-3 no-underline group">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                <Smartphone size={20} />
              </div>
              <span className="text-2xl font-black text-white italic tracking-tighter">FinderHub.</span>
            </Link>
          </div>

          <div className="z-10">
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Join the <br />
              <span className="text-secondary italic">Community.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm mb-8">
              Create an account and help us reunite more people with their belongings.
            </p>
            
            <div className="space-y-4">
              {[
                'Global recovery network',
                'Real-time geo-alerts',
                'Secure verification system'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300 font-bold text-sm">
                  <CheckCircle2 size={18} className="text-secondary" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="z-10 bg-white/5 border border-white/10 p-6 rounded-[30px] backdrop-blur-md">
            <div className="flex -space-x-3 mb-4">
              {[10, 11, 12, 13, 14].map(i => <img key={i} src={`https://i.pravatar.cc/100?img=${i}`} className="w-10 h-10 rounded-full border-2 border-slate-900" />)}
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-secondary text-white font-black text-[10px] flex items-center justify-center">+40k</div>
            </div>
            <p className="text-xs font-bold text-slate-400">Trusted by thousands of members worldwide</p>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-3 p-10 lg:p-16 overflow-y-auto max-h-[90vh]">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-slate-500 font-bold text-sm">Sign up to get started with FindBack</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 font-bold text-sm"
              >
                <ShieldAlert size={20} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors" size={18} />
                  <input 
                    type="text" 
                    name="username"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white font-bold text-base focus:bg-white dark:focus:bg-slate-700/50 focus:border-secondary/50 transition-all outline-none"
                    placeholder="John Doe"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors" size={18} />
                  <input 
                    type="email" 
                    name="email"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white font-bold text-base focus:bg-white dark:focus:bg-slate-700/50 focus:border-secondary/50 transition-all outline-none"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors" size={18} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-12 text-slate-900 dark:text-white font-bold text-base focus:bg-white dark:focus:bg-slate-700/50 focus:border-secondary/50 transition-all outline-none"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors" size={18} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="confirmPassword"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white font-bold text-base focus:bg-white dark:focus:bg-slate-700/50 focus:border-secondary/50 transition-all outline-none"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

        

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary bg-gradient-to-r from-secondary to-primary py-4 rounded-2xl text-lg flex justify-center items-center gap-2 group transition-all"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <span className="relative px-4 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Or continue with</span>
            </div>

            <div className="flex justify-center mb-8">
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

            <p className="text-center text-slate-500 font-bold text-sm">
              Already have an account? {' '}
              <Link to="/login" className="text-secondary font-black hover:text-secondary/80 transition-colors underline underline-offset-4">Sign In</Link>
            </p>
            
            <Link to="/" className="mt-8 mx-auto flex items-center justify-center gap-2 text-slate-400 hover:text-secondary transition-colors no-underline font-black text-[10px] uppercase tracking-widest w-fit">
              <ChevronLeft size={14} /> Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
