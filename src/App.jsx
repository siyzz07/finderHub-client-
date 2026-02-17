import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Menu, X, Sun, Moon, LogIn, ShieldCheck, Heart, LayoutDashboard, Plus, ArrowRight, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppRouter from './routes/AppRouter';
import ReportItemForm from './components/ReportItemForm';
import MyItemsModal from './components/MyItemsModal';

const Navbar = ({ theme, toggleTheme, onReportClick, onMyItemsClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isLoggedIn = !!sessionStorage.getItem('accessToken');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = (isLoggedIn && user.role === 'admin') || location.pathname.startsWith('/admin') 
    ? [] 
    : [
        { name: 'Home', path: '/', icon: <Search size={20} /> },
        { name: 'About', path: '/#about', icon: <Shield size={20} /> },
      ];

  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/admin/login') return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled || isLoggedIn ? 'py-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-lg border-b border-slate-100 dark:border-slate-800' : 'py-8 bg-transparent'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <div className="w-12 h-12 bg-slate-900 dark:bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-transform">
            <Search size={24} strokeWidth={3} />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">FinderHub</span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            link.path.includes('#') ? (
              <a 
                key={link.name} 
                href={link.path} 
                className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all no-underline ${
                  location.hash === link.path.substring(link.path.indexOf('#')) ? 'text-primary' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all no-underline ${
                  location.pathname === link.path ? 'text-primary' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        <div className="flex items-center gap-6">
          {/* <button 
            onClick={toggleTheme}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button> */}
          
          <div className="hidden lg:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-6">
                {user.role !== 'admin' && (
                  <div className="flex items-center gap-3 mr-4">
                      <button 
                        onClick={() => onReportClick('Lost')}
                        className="h-12 px-6 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all no-underline shadow-lg shadow-red-500/20 border-none cursor-pointer"
                      >
                          <Plus size={18} /> Report Lost
                      </button>
                      <button 
                        onClick={onMyItemsClick}
                        className="h-12 px-6 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary-dark transition-all no-underline shadow-lg shadow-primary/20 border-none cursor-pointer"
                      >
                          <Heart size={18} /> Posted Items
                      </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-primary p-0.5">
                    <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase text-xs">
                        {user.username?.[0]}
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tighter text-sm">{user.username}</span>
                </div>
                <button onClick={handleLogout} className="h-12 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-red-500 hover:text-white">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs no-underline hover:text-primary transition-all">Sign In</Link>
                <Link to="/signup" className="btn-primary no-underline px-8 py-3.5 rounded-2xl text-xs uppercase tracking-widest font-black shadow-lg shadow-primary/20">
                  Join Now
                </Link>
              </>
            )}
          </div>

          <button 
            className="lg:hidden w-12 h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link) => (
                link.path.includes('#') ? (
                  <a 
                    key={link.name} 
                    href={link.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between text-2xl font-black text-slate-900 dark:text-white no-underline italic"
                  >
                    {link.name}
                    <ArrowRight size={20} className="text-primary" />
                  </a>
                ) : (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between text-2xl font-black text-slate-900 dark:text-white no-underline italic"
                  >
                    {link.name}
                    <ArrowRight size={20} className="text-primary" />
                  </Link>
                )
              ))}
              {isLoggedIn && user.role !== 'admin' && (
                <button 
                  onClick={() => { setMobileMenuOpen(false); onMyItemsClick(); }}
                  className="flex items-center justify-between text-2xl font-black text-slate-900 dark:text-white no-underline italic border-none bg-transparent cursor-pointer text-left"
                >
                    Posted Items
                    <ArrowRight size={20} className="text-primary" />
                </button>
              )}
              <div className="pt-8 flex flex-col gap-4">
                {isLoggedIn ? (
                  <button onClick={handleLogout} className="btn-primary w-full h-16 rounded-3xl text-lg font-black italic">Logout</button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full h-16 bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-3xl font-black text-slate-900 dark:text-white no-underline text-lg italic">Sign In</Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full h-16 flex items-center justify-center rounded-3xl font-black text-white no-underline text-lg italic">Join Now</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
    const location = useLocation();
    if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/admin')) return null;
    
    return (
      <footer className="py-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-3 no-underline mb-8">
                <div className="w-12 h-12 bg-slate-900 dark:bg-primary rounded-2xl flex items-center justify-center text-white font-black italic">F</div>
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">FinderHub.</span>
              </Link>
              <p className="text-xl text-slate-500 font-medium max-w-sm mb-10 leading-relaxed">
                Reuniting the world, one item at a time. The most secure community-driven lost and found network.
              </p>
              <div className="flex gap-4">
                {['TW', 'FB', 'IG', 'LI'].map(social => (
                  <a key={social} href="#" className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 font-black hover:text-primary transition-all">
                    {social}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-10">Company</h4>
              <ul className="list-none flex flex-col gap-5">
                <li><Link to="/" className="text-slate-400 font-bold hover:text-primary no-underline transition-all">About Us</Link></li>
                <li><Link to="/" className="text-slate-400 font-bold hover:text-primary no-underline transition-all">Careers</Link></li>
                <li><Link to="/" className="text-slate-400 font-bold hover:text-primary no-underline transition-all">Impact</Link></li>
                <li><Link to="/" className="text-slate-400 font-bold hover:text-primary no-underline transition-all">Newsroom</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-10">Resources</h4>
              <ul className="list-none flex flex-col gap-5">
                <li><Link to="/" className="text-slate-400 font-bold hover:text-primary no-underline transition-all">Community Guide</Link></li>
                <li><Link to="/" className="text-slate-400 font-bold hover:text-primary no-underline transition-all">Safety Center</Link></li>
                <li><Link to="/" className="text-slate-400 font-bold hover:text-primary no-underline transition-all">API Docs</Link></li>
                <li><Link to="/admin/login" className="text-slate-400 font-bold hover:text-primary no-underline transition-all">Admin Portal</Link></li>
                <li><Link to="/" className="text-slate-400 font-bold hover:text-primary no-underline transition-all">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-20 border-t border-slate-100 dark:border-slate-800 flex flex-col md:row justify-between items-center gap-10">
            <p className="text-lg font-bold text-slate-400 italic">© 2026 FinderHub. All rights reserved.</p>
            <div className="flex gap-10 text-xs font-black uppercase tracking-widest text-slate-400">
                <a href="#" className="hover:text-primary transition-all">Privacy</a>
                <a href="#" className="hover:text-primary transition-all">Terms</a>
                <a href="#" className="hover:text-primary transition-all">Status</a>
            </div>
          </div>
        </div>
      </footer>
    );
};

export default function App() {
  const [theme, setTheme] = useState('light');
  const [reportModal, setReportModal] = useState({ show: false, type: 'Lost' });
  const [myItemsOpen, setMyItemsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleReportClick = (type) => {
    setReportModal({ show: true, type });
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 selection:bg-primary selection:text-white transition-colors duration-500">
        <Navbar 
            theme={theme} 
            toggleTheme={toggleTheme} 
            onReportClick={handleReportClick} 
            onMyItemsClick={() => setMyItemsOpen(true)}
        />
        <main className="flex-grow">
          <AppRouter />
        </main>
        <Footer />
        
        {reportModal.show && (
          <ReportItemForm 
            type={reportModal.type} 
            onClose={() => setReportModal({ ...reportModal, show: false })}
            onSuccess={() => {
              alert("Successfully submitted for admin approval!");
            }}
          />
        )}

        {myItemsOpen && (
            <MyItemsModal onClose={() => setMyItemsOpen(false)} />
        )}
      </div>
    </Router>
  );
}
