import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Clock, Tag, Share2, Flag, CheckCircle, 
  ArrowLeft, MessageCircle, ShieldCheck, Info,
  ChevronRight, ExternalLink, Heart, Navigation, Mail, Phone, Loader2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiRequest } from '../utils/api';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
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
        alert(`Status updated to ${newStatus}!`);
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
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
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-xl font-bold text-slate-500">Loading item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Item Not Found</h2>
        <p className="text-slate-500 mb-8">The item you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Search
        </Link>
      </div>
    );
  }

  const images = item.images && item.images.length > 0 ? item.images : [item.image];

  const ClaimModal = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass w-full max-w-lg p-8 shadow-2xl relative"
      >
        <button 
          onClick={() => setShowClaimModal(false)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-muted hover:text-primary transition-colors border-none"
        >
          <Flag size={20} className="rotate-45" />
        </button>
        <h2 className="text-2xl font-bold mb-2">Submit Claim Request</h2>
        <p className="text-muted mb-6">Provide details to prove this item belongs to you. Our admins will review the request.</p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Describe Unique Features</label>
            <textarea 
              placeholder="e.g. Serial number, specific scratches, wallpaper description..."
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none min-h-[120px] focus:ring-2 ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Upload Proof (Images/Receipts)</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Tag className="text-primary" size={24} />
              </div>
              <p className="text-sm font-medium">Click to upload or drag & drop</p>
              <p className="text-xs text-muted mt-1">JPG, PNG up to 10MB</p>
            </div>
          </div>
          <button type="button" className="btn-primary w-full py-4 text-lg">
            Submit My Claim
          </button>
          <p className="text-xs text-center text-muted">
            By submitting, you agree to our verification process and terms.
          </p>
        </form>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-6 py-8">
      {showClaimModal && <ClaimModal />}
      
      <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold no-underline mb-8 hover:gap-3 transition-all">
        <ArrowLeft size={18} /> Back to Search
      </Link>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Images & Description */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-2 rounded-[2rem] overflow-hidden"
            >
              <img 
                src={activeImage} 
                alt={item.title} 
                className="w-full aspect-video lg:aspect-auto lg:h-[500px] object-cover rounded-[1.8rem]"
              />
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-4 px-2">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${activeImage === img ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass p-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-4 py-1.5 rounded-full font-bold border text-sm ${item.type === 'Lost' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                {item.type} Item
              </span>
              <span className="px-4 py-1.5 rounded-full glass text-muted text-sm flex items-center gap-2">
                <Tag size={16} /> {item.category}
              </span>
              <span className="px-4 py-1.5 rounded-full glass text-muted text-sm flex items-center gap-2">
                <Clock size={16} /> Posted {new Date(item.createdAt).toLocaleDateString()}
              </span>
              <span className={`px-4 py-1.5 rounded-full font-bold border text-sm ${item.status === 'Lost' || item.status === 'Found' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                Status: {item.status}
              </span>
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-extrabold mb-6 leading-tight">{item.title}</h1>
            
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="text-primary" />
              <div className="text-lg flex-grow">
                <p className="font-bold">{item.location}</p>
                {item.contactNumber && (
                  <p className="text-sm text-primary font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                    <MessageCircle size={14} /> Contact: {item.contactNumber}
                  </p>
                )}
              </div>
              
              {isOwner && (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Owner Controls</p>
                  <div className="flex gap-2">
                    {item.type === 'Lost' ? (
                      <button 
                        onClick={() => handleStatusUpdate('Returned')}
                        disabled={updating || item.status === 'Returned'}
                        className="h-10 px-4 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all border-none cursor-pointer disabled:opacity-50"
                      >
                        {updating ? <Loader2 size={14} className="animate-spin" /> : 'Mark as Returned'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusUpdate('Claimed')}
                        disabled={updating || item.status === 'Claimed'}
                        className="h-10 px-4 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all border-none cursor-pointer disabled:opacity-50"
                      >
                        {updating ? <Loader2 size={14} className="animate-spin" /> : 'Mark as Claimed'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Description</h3>
              <p className="text-lg text-muted leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>
          </div>

          {/* Interactive Map Section */}
          <div className="glass p-8 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin size={24} className="text-primary" /> Discovery Node
              </h3>
              {item.location_point?.coordinates && (
                <a 
                  href={`https://www.google.com/maps?q=${item.location_point.coordinates[1]},${item.location_point.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-3 transition-all no-underline"
                >
                  Deep Link Maps <ExternalLink size={14} />
                </a>
              )}
            </div>
            {item.location_point?.coordinates ? (
              <a 
                href={`https://www.google.com/maps?q=${item.location_point.coordinates[1]},${item.location_point.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-[400px] rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 relative shadow-inner group/map"
              >
                <div className="absolute inset-0 z-[400] bg-slate-900/0 group-hover/map:bg-slate-900/10 transition-colors flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-slate-900/90 px-4 py-2 rounded-xl shadow-2xl opacity-0 group-hover/map:opacity-100 transition-opacity transform translate-y-4 group-hover/map:translate-y-0 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary">
                        <Navigation size={14} /> Start Navigation
                    </div>
                </div>
                 <MapContainer 
                    center={[item.location_point.coordinates[1], item.location_point.coordinates[0]]} 
                    zoom={15} 
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                    className="w-full h-full grayscale-[0.2] dark:grayscale-[0.8] pointer-events-none"
                 >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <Marker position={[item.location_point.coordinates[1], item.location_point.coordinates[0]]} />
                 </MapContainer>
              </a>
            ) : (
              <div className="w-full h-[400px] rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px] border border-slate-100 dark:border-slate-800">
                 Coordinate data unavailable
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Sidebar */}
        <div className="space-y-8">
          {/* Owner Box */}
          <div className="glass p-8">
            <h3 className="text-xl font-bold mb-6">Contact {item.type === 'Lost' ? 'Owner' : 'Finder'}</h3>
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
              <img src={`https://i.pravatar.cc/150?u=${item.poster?._id || item.poster}`} className="w-16 h-16 rounded-2xl object-cover" alt="avatar" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg">{item.poster?.username || 'Verified User'}</p>
                  <ShieldCheck size={18} className="text-blue-500" />
                </div>
                <p className="text-sm text-muted">Join Date: {new Date(item.poster?.createdAt || Date.now()).getFullYear()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                  <p className="font-bold text-sm truncate max-w-[180px]">{item.poster?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Signal</p>
                  <p className="font-bold text-sm">{item.contactNumber || 'No number provided'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
