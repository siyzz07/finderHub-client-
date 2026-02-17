import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Loader2, CheckCircle2, Package, RefreshCw, Filter, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { apiRequest } from '../utils/api';

const PostItem = ({ item, onStatusUpdate }) => {
  const statusColors = {
    Approved: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    Pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    Found: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    Returned: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    Claimed: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  };

  const isApproved = item.isApproved;
  const displayStatus = !isApproved ? 'Pending' : (item.status === item.type ? 'Active' : item.status);

  const getActionButton = () => {
    if (!isApproved) return (
        <div className="flex items-center gap-2 text-amber-500 font-black text-[9px] uppercase tracking-widest bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10">
            <Clock size={12} /> Awaiting Sync
        </div>
    );
    if (item.status === 'Lost') {
      return (
        <button 
          onClick={() => onStatusUpdate(item._id, 'Found')}
          className="h-10 px-5 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 border-none cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <CheckCircle2 size={14} /> Item Found
        </button>
      );
    }
    if (item.status === 'Found') {
      return (
        <button 
          onClick={() => onStatusUpdate(item._id, 'Returned')}
          className="h-10 px-5 bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 border-none cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <RefreshCw size={14} /> Item Returned
        </button>
      );
    }
    return (
        <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10">
            <ShieldCheck size={14} /> Mission Resolved
        </div>
    );
  };

  return (
    <motion.div 
        layout
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="bg-white dark:bg-[#1e293b]/30 p-5 rounded-[2.5rem] flex flex-col sm:flex-row gap-6 items-center border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5"
    >
      <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm relative">
        <img src={item.images?.[0] || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex-grow w-full space-y-3">
        <div className="flex justify-between items-start">
          <div>
              <h4 className="text-xl font-black italic text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors tracking-tight">{item.title}</h4>
              <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${statusColors[displayStatus] || 'text-slate-500 border-slate-200'}`}>
                    {displayStatus}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.category}</span>
              </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
              <ExternalLink size={16} />
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-slate-50 dark:border-slate-800/50 pt-4">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <MapPin size={12} className="text-primary" /> {item.location.split(',')[0]}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Clock size={12} className="text-secondary" /> {new Date(item.createdAt).toLocaleDateString()}
          </span>
          <div className="ml-auto">
            {getActionButton()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function MyItemsModal({ onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const response = await apiRequest('/items/my-items');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await apiRequest(`/items/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-2xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-[#0f172a] w-full max-w-4xl rounded-[3.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.1)] border border-white/20 overflow-hidden flex flex-col max-h-[88vh]"
      >
        <div className="p-10 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/30 dark:bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Command Center</span>
            </div>
            <h2 className="text-4xl font-black italic text-slate-900 dark:text-white tracking-tighter">My Posted <span className="text-slate-300 dark:text-slate-800 not-italic">Items.</span></h2>
          </div>
          <button onClick={onClose} className="w-14 h-14 bg-white dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer shadow-sm group">
            <X size={24} className="text-slate-400 group-hover:text-white" />
          </button>
        </div>

        <div className="flex-grow p-10 overflow-y-auto space-y-6 custom-scrollbar">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Synchronizing Local Assets...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-40 text-center space-y-8">
              <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-200 dark:text-slate-800">
                <Package size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white italic mb-2">Null Archive.</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No activity logs found in your account.</p>
              </div>
              <button onClick={onClose} className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:scale-105 transition-all cursor-pointer border-none shadow-xl">Start Reporting</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
                {items.map(item => (
                  <PostItem key={item._id} item={item} onStatusUpdate={handleStatusUpdate} />
                ))}
            </div>
          )
          }
        </div>

        <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a]">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Live</span>
            </div>
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] italic">
                FinderHub. Protocol v4.2
            </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
