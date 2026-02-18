import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Upload, MapPin, Loader2, Search, Plus, Sparkles, Image as ImageIcon, CheckCircle, Shield, AlertCircle, Navigation, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { apiRequest } from '../utils/api';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const MapHandler = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

export default function ReportItemForm({ onClose, onSuccess, type = 'Lost' }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Phones',
    location: '',
    contactNumber: '',
  });
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setAddressLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        alert("Unable to retrieve your location.");
        setAddressLoading(false);
      }
    );
  };

  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!mapSearch.trim()) return;
    setSearchLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        alert("Location not found.");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (position) {
      const getAddress = async () => {
        setAddressLoading(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.lat}&lon=${position.lng}`
          );
          const data = await response.json();
          setFormData(prev => ({ ...prev, location: data.display_name }));
        } catch (error) {
          console.error("Error fetching address:", error);
        } finally {
          setAddressLoading(false);
        }
      };
      getAddress();
    }
  }, [position]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 3) {
      alert("Maximum 3 images allowed.");
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) return alert("Please pin item location on map.");
    if (imageFiles.length === 0) return alert("Please upload at least one image.");
    if (formData.contactNumber.length < 10) return alert("Please enter a valid 10-digit phone number.");

    setLoading(true);
    try {
      const imageFormData = new FormData();
      imageFiles.forEach(file => imageFormData.append('images', file));

      const uploadResponse = await apiRequest('/items/upload', {
        method: 'POST',
        body: imageFormData,
      });

      if (!uploadResponse.ok) throw new Error("Image upload failed.");
      const { imageUrls } = await uploadResponse.json();

      const response = await apiRequest('/items', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          location: formData.location || `Pinned Location (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`,
          images: imageUrls,
          type,
          lat: position.lat,
          lng: position.lng
        }),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || "Submission failed.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (val) => {
    // Only allow digits and limit to reasonable phone length
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 15) {
      setFormData({...formData, contactNumber: digits});
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-[#0f172a] w-full max-w-6xl rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.1)] border border-white/20 overflow-hidden flex flex-col lg:flex-row max-h-[92vh]"
      >
        {/* Map Panel - Left */}
        <div className="w-full lg:w-[45%] h-72 lg:h-auto border-r border-slate-100 dark:border-slate-800/50 relative">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} className="w-full h-full">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <LocationMarker position={position} setPosition={setPosition} />
            {position && (
              <Circle 
                center={position} 
                radius={500} 
                pathOptions={{ 
                  fillColor: '#3b82f6', 
                  fillOpacity: 0.1, 
                  color: '#3b82f6', 
                  weight: 1,
                  dashArray: '5, 5'
                }} 
              />
            )}
            <MapHandler center={position} />
          </MapContainer>
          
          <div className="absolute top-6 left-6 right-6 z-[1000] space-y-3">
            <form onSubmit={handleMapSearch} className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
               <input 
                 type="text"
                 placeholder="Locate area on map..."
                 className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur shadow-2xl border border-white/20 outline-none text-sm font-bold dark:text-white transition-all focus:ring-4 ring-primary/10"
                 value={mapSearch}
                 onChange={(e) => setMapSearch(e.target.value)}
               />
               {searchLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={18} />}
            </form>
            <button 
              type="button"
              onClick={handleUseMyLocation}
              className="w-full h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl border-none cursor-pointer"
            >
              <Navigation size={14} /> Detect My Location
            </button>
          </div>

          <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur px-5 py-3 rounded-2xl shadow-xl border border-white/20">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Tap to pin discovery node</p>
             </div>
          </div>
        </div>

        {/* Form Panel - Right */}
        <div className="w-full lg:w-[55%] p-10 lg:p-14 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <Shield size={24} className="text-primary" />
                 <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Secure Protocol</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter">Report {type} <span className="text-slate-300 dark:text-slate-800 not-italic">Asset.</span></h2>
            </div>
            <button onClick={onClose} className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer group">
              <X size={20} className="text-slate-400 group-hover:text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity/Title</label>
                    <input 
                        required
                        type="text" 
                        placeholder="e.g. Lost Silver iPhone"
                        className="w-full px-6 h-16 bg-slate-50 dark:bg-slate-800/40 border border-transparent rounded-2xl text-base font-bold focus:ring-4 ring-primary/5 transition-all outline-none dark:text-white focus:border-primary/20"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category Hub</label>
                    <select 
                        className="w-full px-6 h-16 bg-slate-50 dark:bg-slate-800/40 border border-transparent rounded-2xl text-base font-bold focus:ring-4 ring-primary/5 transition-all outline-none dark:text-white appearance-none cursor-pointer focus:border-primary/20"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                        {['Phones', 'Wallets', 'Keys', 'Ornaments', 'Documents', 'Accessories', 'Pets', 'Others'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        required
                        type="text" 
                        inputMode="numeric"
                        placeholder="Enter 10-digit mobile number"
                        className="w-full pl-14 pr-6 h-16 bg-slate-50 dark:bg-slate-800/40 border border-transparent rounded-2xl text-base font-bold focus:ring-4 ring-primary/5 transition-all outline-none dark:text-white focus:border-primary/20"
                        value={formData.contactNumber}
                        onChange={(e) => validatePhoneNumber(e.target.value)}
                    />
                </div>
                {formData.contactNumber && formData.contactNumber.length < 10 && (
                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-widest">Number must be at least 10 digits</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                    Visual Evidence ({imageFiles.length}/3)
                    <Sparkles size={14} className="text-primary" />
                </label>
                <div className="flex gap-4">
                    {imagePreviews.map((preview, index) => (
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} key={index} className="relative w-20 h-20 rounded-2xl overflow-hidden group border border-slate-200 dark:border-slate-800">
                             <img src={preview} className="w-full h-full object-cover" alt="prev" />
                             <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer">
                                <X size={20} />
                             </button>
                        </motion.div>
                    ))}
                    {imageFiles.length < 3 && (
                        <div className="relative w-20 h-20">
                            <input type="file" multiple accept="image/*" className="hidden" id="image-add" onChange={handleImageChange} />
                            <label htmlFor="image-add" className="w-full h-full bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                                <Plus size={20} />
                                <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Add Image</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Description</label>
                <textarea 
                    required rows="3"
                    placeholder="Provide unique characteristics, serial numbers, or security marks..."
                    className="w-full p-6 bg-slate-50 dark:bg-slate-800/40 border border-transparent rounded-2xl text-base font-bold focus:ring-4 ring-primary/5 transition-all outline-none dark:text-white resize-none focus:border-primary/20"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <div className="space-y-3">
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${position ? 'bg-emerald-500 text-white animate-bounce' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                        <MapPin size={24} />
                    </div>
                    <div className="flex-grow">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Syncing</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{formData.location || 'Awaiting map pin...'}</p>
                    </div>
                    {addressLoading && <Loader2 className="animate-spin text-primary" size={20} />}
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                    <AlertCircle size={14} className="text-amber-500" />
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Post requires admin synchronization before public broadcast</p>
                </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black uppercase tracking-[0.4em] rounded-[2rem] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-2xl shadow-slate-900/10 cursor-pointer border-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> Synchronize Report</>}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
