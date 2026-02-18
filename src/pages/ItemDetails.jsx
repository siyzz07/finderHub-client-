import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Clock, Tag, Share2, Flag, CheckCircle, 
  ArrowLeft, MessageCircle, ShieldCheck, Info,
  ChevronRight, ExternalLink, Heart, Navigation, Mail, Phone, 
  Loader2, Calendar, User, Eye, Map as MapIcon, Copy, Check
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiRequest } from '../utils/api';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  // Using custom colored markers for better visibility
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isOwner = item && (item.poster?._id === user?._id || item.poster === user?._id);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await apiRequest(`/items/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const updatedItem = await response.json();
        setItem(updatedItem);
        // Better notification could be used here
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await apiRequest(`/items/${id}`);
        if (response.ok) {
          const data = await response.json();
          setItem(data);
          setActiveImage(data.images?.[0] || data.image);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <p className="mt-8 text-xl font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Scanning Data...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Info size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 italic tracking-tighter">Object <span className="text-slate-300">De-synchronized.</span></h2>
          <p className="text-slate-500 mb-12 max-w-md mx-auto">The asset you are attempting to access is no longer active in our database hierarchy.</p>
          <Link to="/" className="inline-flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
            <ArrowLeft size={18} /> Return to Hub
          </Link>
        </motion.div>
      </div>
    );
  }

  const images = item.images && item.images.length > 0 ? item.images : [item.image];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pb-20">
      {/* Dynamic Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
          </Link>
          
          <div className="hidden md:flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Asset Portfolio</span>
             <h2 className="text-sm font-bold truncate max-w-[200px]">{item.title}</h2>
          </div>

          <div className="flex gap-2">
            <button onClick={copyToClipboard} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-none cursor-pointer">
              {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
            </button>
            <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-none cursor-pointer">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Visual Display - 7 Columns */}
          <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
            <div className="relative group">
               {/* Type Badge Floating */}
               <div className="absolute top-6 left-6 z-10 flex gap-2">
                  <div className={`px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest backdrop-blur-xl shadow-2xl border ${item.type === 'Lost' ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'}`}>
                    {item.type} Property
                  </div>
                  <div className="px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white/10 text-white border border-white/20 backdrop-blur-md">
                    {item.category}
                  </div>
               </div>

               <motion.div 
                 layoutId="activeImage"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="aspect-[16/10] xl:aspect-auto xl:h-[600px] rounded-[3rem] overflow-hidden bg-slate-200 dark:bg-slate-900 shadow-2xl relative"
               >
                 <img 
                   src={activeImage} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                   alt="Active item" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
               </motion.div>

               {/* Thumbnails */}
               {images.length > 1 && (
                 <div className="flex flex-wrap gap-4 mt-6">
                    {images.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-24 h-24 rounded-3xl overflow-hidden group/thumb transition-all duration-300 border-none cursor-pointer ${activeImage === img ? 'ring-4 ring-primary ring-offset-4 dark:ring-offset-[#020617] scale-105' : 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="prev" />
                      </button>
                    ))}
                 </div>
               )}
            </div>

            {/* Content Details */}
            <div className="bg-white dark:bg-slate-900/40 rounded-[3rem] p-8 lg:p-12 shadow-xl border border-white dark:border-white/5 space-y-12">
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <Calendar className="text-primary" size={18} />
                     <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Recorded on {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none mb-8">
                    {item.title}
                  </h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <MapPin className="text-primary mb-4" size={24} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Location node</p>
                        <p className="font-bold text-white text-sm line-clamp-2">{item.location}</p>
                     </div>
                     <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <Tag className="text-secondary mb-4" size={24} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Catalog Category</p>
                        <p className="font-bold text-white text-sm">{item.category}</p>
                     </div>
                     <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <CheckCircle className="text-emerald-500 mb-4" size={24} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Protocol Status</p>
                        <p className="font-bold text-white text-sm uppercase tracking-tighter">{item.status}</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <Info className="text-primary" size={20} />
                     <h3 className="text-xl text-white font-black uppercase tracking-widest italic">Asset Description</h3>
                  </div>
                  <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                    {item.description}
                  </p>
               </div>
            </div>

            {/* Map Section */}
            <div className="bg-white dark:bg-slate-900/40 rounded-[3rem] p-4 shadow-xl border border-white dark:border-white/5 overflow-hidden">
                <div className="relative h-[450px] w-full rounded-[2.5rem] overflow-hidden group">
                  <div className="absolute top-6 left-6 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
                     <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Geo-Lock Precision Sync</span>
                  </div>
                  
                  {item.location_point?.coordinates ? (
                    <>
                    <MapContainer 
                      center={[item.location_point.coordinates[1], item.location_point.coordinates[0]]} 
                      zoom={15} 
                      scrollWheelZoom={false}
                      className="w-full h-full"
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                      <Marker position={[item.location_point.coordinates[1], item.location_point.coordinates[0]]} />
                      <Circle 
                        center={[item.location_point.coordinates[1], item.location_point.coordinates[0]]} 
                        radius={300} 
                        pathOptions={{ 
                          fillColor: '#3b82f6', 
                          fillOpacity: 0.15, 
                          color: '#3b82f6', 
                          weight: 1.5,
                          dashArray: '8, 8'
                        }} 
                      />
                    </MapContainer>
                    <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 dark:border-slate-900/20 rounded-[2.5rem] z-[401]" />
                    <a 
                      href={`https://www.google.com/maps?q=${item.location_point.coordinates[1]},${item.location_point.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-8 right-8 z-[402] bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 active:scale-95 hover:shadow-primary/20 transition-all shadow-2xl no-underline"
                    >
                      Initialize Navigation <Navigation size={14} className="animate-pulse" />
                    </a>
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 font-black uppercase tracking-widest">
                       Co-ordinate sync failed
                    </div>
                  )}
                </div>
            </div>
          </div>

          {/* Sidebar / Action Panel - 4 Columns */}
          <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
             {/* Contact Card */}
             <div className="bg-white dark:bg-slate-900/40 rounded-[3rem] p-8 lg:p-10 shadow-xl border border-white dark:border-white/5 sticky top-32">
                <div className="text-center mb-10">
                   {/* <div className="relative inline-block mb-6">
                      <img 
                        src={`https://i.pravatar.cc/200?u=${item.poster?._id || item.poster}`} 
                        className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-primary/20 p-1" 
                        alt="Poster" 
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900">
                        <ShieldCheck size={20} />
                      </div>
                   </div> */}
                   <h3 className="text-2xl text-white font-black italic tracking-tight">{item.poster?.username || 'Verified Poster'}</h3>
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Member since {new Date(item.poster?.createdAt || Date.now()).getFullYear()}</p>
                </div>

                <div className="space-y-4 mb-10">
                   <a 
                    href={`tel:${item.contactNumber}`}
                    className="flex flex-col p-6 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-[2rem] transition-all group no-underline"
                   >
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                          <Phone size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Direct Line</p>
                          <p className="text-lg font-black dark:text-white tabular-nums">{item.contactNumber || 'System Offline'}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] font-bold text-center uppercase tracking-widest opacity-0 group-hover:opacity-60 transition-opacity">Tap to trigger call protocol</div>
                   </a>

                   <a 
                    href={`mailto:${item.poster?.email}`}
                    className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-white/5 hover:bg-primary/5 border border-slate-100 dark:border-white/5 rounded-[2rem] transition-all group no-underline"
                   >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <Mail size={18} />
                      </div>
                      <div className="truncate">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email Hub</p>
                        <p className="text-sm font-bold truncate dark:text-white">{item.poster?.email || 'Synchronizing...'}</p>
                      </div>
                   </a>
                </div>

                <div className="space-y-4">
                  {isOwner ? (
                    <div className="p-6 bg-slate-900 dark:bg-white rounded-[2rem] space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 text-center">Owner Console</p>
                      
                      {item.type === 'Lost' ? (
                        <button 
                          onClick={() => handleStatusUpdate('Returned')}
                          disabled={updating || item.status === 'Returned'}
                          className="w-full py-5 rounded-[1.5rem] bg-emerald-500 text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-none cursor-pointer disabled:opacity-50 shadow-xl"
                        >
                          {updating ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={20} /> Marked as Returned</>}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStatusUpdate('Claimed')}
                          disabled={updating || item.status === 'Claimed'}
                          className="w-full py-5 rounded-[1.5rem] bg-blue-500 text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-none cursor-pointer disabled:opacity-50 shadow-xl"
                        >
                          {updating ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={20} /> Marked as Claimed</>}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowClaimModal(true)}
                      className="w-full py-6 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-4 group border-none cursor-pointer"
                    >
                      Initialize Claim <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  )}

                  <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-start gap-4">
                     <ShieldCheck className="text-amber-500 shrink-0" size={18} />
                     <p className="text-[9px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-relaxed">
                       Security Protocol: Always meet in public hubs. Do not share financial encryption keys.
                     </p>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Claim Modal Redesigned */}
      <AnimatePresence>
        {showClaimModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 min-h-screen">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowClaimModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-10 lg:p-14 shadow-[0_32px_128px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden border border-white/20"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
              
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-6">
                  <Flag size={32} />
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter">Submit Identification <span className="text-slate-400">Protocol.</span></h2>
                <p className="text-slate-500 mt-4 leading-relaxed font-medium">Provide evidentiary details to establish asset ownership.</p>
              </div>

              <form className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Evidence Description</label>
                  <textarea 
                    placeholder="e.g. Serial numbers, unique internal markings, custom wallpapers..."
                    className="w-full p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-transparent focus:border-primary/20 focus:ring-4 ring-primary/5 transition-all outline-none min-h-[160px] font-bold resize-none"
                  />
                </div>

                <div className="p-8 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] text-center group hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                   <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                      <Tag className="text-primary" size={24} />
                   </div>
                   <p className="text-sm font-black uppercase tracking-widest mb-1">Upload Digital Evidence</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receipts, Photo Proof (Max 10MB)</p>
                </div>

                <div className="flex gap-4">
                   <button 
                    type="button" 
                    onClick={() => setShowClaimModal(false)}
                    className="flex-1 py-5 rounded-[1.5rem] bg-slate-100 dark:bg-white/5 text-slate-500 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                   >
                     Abort
                   </button>
                   <button 
                    type="button" 
                    className="flex-[2] py-5 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl border-none cursor-pointer flex items-center justify-center gap-3"
                   >
                     Submit Metadata <CheckCircle size={18} />
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
