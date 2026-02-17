import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Filter, ArrowRight, Grid, List as ListIcon, Shield, Users, Clock, Heart, Map as MapIcon, Plus, Menu, X, Sun, Moon, LogIn, ShieldCheck, Navigation, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';

const StatusBadge = ({ status }) => {
  const styles = {
    Lost: 'bg-red-500/10 text-red-600 border-red-100',
    Found: 'bg-emerald-500/10 text-emerald-600 border-emerald-100',
    Claimed: 'bg-blue-500/10 text-blue-600 border-blue-100',
    Returned: 'bg-violet-500/10 text-violet-600 border-violet-100',
  };

  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

const ItemCard = ({ item }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white dark:bg-[#0f172a] rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/50 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
  >
    <Link to={`/item/${item._id}`} className="block no-underline">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.images?.[0] || item.image} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={item.status} />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
             <p className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <MapPin size={10} className="text-primary" /> {item.location.split(',')[0]}
             </p>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 truncate group-hover:text-primary transition-colors italic tracking-tight">{item.title}</h3>
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
            </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

const SearchSection = ({ searchTerm, setSearchTerm, currentCategory, setCurrentCategory, handleSearch, userLocation, setUserLocation, locating, setLocationCoords }) => {
    const [locInput, setLocInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchingLoc, setSearchingLoc] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (query) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }
        setSearchingLoc(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Location search error:', error);
        } finally {
            setSearchingLoc(false);
        }
    };

    useEffect(() => {
        if (locInput.length >= 3) {
            const timer = setTimeout(() => {
                fetchSuggestions(locInput);
            }, 600);
            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [locInput]);

    const handleLocInputChange = (e) => {
        const val = e.target.value;
        setLocInput(val);
        if (val === '') {
            setLocationCoords(null);
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        setLocInput(suggestion.display_name);
        setLocationCoords({
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon),
            name: suggestion.display_name
        });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <section className="container mx-auto px-6 -mt-12 relative ">
            <div className="bg-white dark:bg-[#0f172a] p-3 lg:p-4 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-grow relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Find lost item by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-14 pr-6 h-16 bg-slate-50 dark:bg-[#020617] border-none rounded-2xl text-base font-bold focus:ring-4 ring-primary/5 transition-all outline-none dark:text-white"
                        />
                    </div>
                    
                    <div className="lg:w-1/3 relative group" ref={suggestionRef}>
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder={locating ? "Locating..." : "Filter by proximity..."}
                            value={locating ? "My Location" : locInput}
                            onChange={handleLocInputChange}
                            className="w-full pl-14 pr-14 h-16 bg-slate-50 dark:bg-[#020617] border-none rounded-2xl text-base font-bold focus:ring-4 ring-primary/5 transition-all outline-none dark:text-white"
                        />
                        <button 
                            onClick={setUserLocation}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${userLocation && !locInput ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {locating ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                        </button>

                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[1002]"
                                >
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectSuggestion(s)}
                                            className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/5 border-none bg-transparent cursor-pointer flex items-start gap-3 transition-colors"
                                        >
                                            <MapPin size={16} className="text-slate-400 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{s.display_name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Region Node</p>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button 
                        onClick={handleSearch}
                        className="lg:w-40 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 border-none cursor-pointer"
                    >
                        Search
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 items-center px-4 overflow-x-auto pb-2 scrollbar-none">
                    {['All Items', 'Phones', 'Wallets', 'Keys', 'Ornaments', 'Documents', 'Accessories', 'Pets'].map(tag => (
                    <button 
                        key={tag} 
                        onClick={() => setCurrentCategory(tag)}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer whitespace-nowrap ${currentCategory === tag ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        {tag}
                    </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default function Home({ showMapOnly = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('All Items');
  const [locationCoords, setLocationCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  
  const isLoggedIn = !!sessionStorage.getItem('accessToken');

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = `/items?search=${searchTerm}`;
      if (currentCategory !== 'All Items') url += `&category=${currentCategory}`;
      if (locationCoords) url += `&lat=${locationCoords.lat}&lng=${locationCoords.lng}&radius=10000`; // 10km radius
      
      const response = await apiRequest(url);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (locationCoords && !locating) {
        setLocationCoords(null);
        return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            setLocationCoords({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            setLocating(false);
        },
        (error) => {
            console.error(error);
            setLocating(false);
            alert("Could not access location. Please enable location permissions.");
        }
    );
  };

  useEffect(() => {
    fetchItems();
  }, [currentCategory, locationCoords]);

  const handleSearch = () => {
    fetchItems();
  };

  if (showMapOnly) {
    return (
      <div className="h-[calc(100vh-100px)] p-6 bg-slate-50 dark:bg-[#020617]">
        <div className="w-full h-full rounded-[3rem] overflow-hidden relative border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-12 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-[3rem] shadow-2xl max-w-sm border border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapIcon size={40} className="text-primary animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 italic tracking-tight">Active Signal.</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8 leading-relaxed">Scanning neural network for geo-located assets...</p>
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] dark:bg-[#020617] min-h-screen pb-20 transition-colors duration-500">
      {!isLoggedIn && (
        <section className="relative pt-40 pb-32 overflow-hidden bg-white dark:bg-[#020617]">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
            <div className="container mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        <Shield size={14} className="fill-primary/20" /> 
                        Encrypted Security Network
                    </div>
                    <h1 className="text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none italic">
                        Recover what belongs <br /> to you. <span className="text-primary not-italic">FinderHub.</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-xl mx-auto">
                        Global community synchronization for verifying and reuniting lost assets with their rightful owners.
                    </p>
                </motion.div>
            </div>
        </section>
      )}
      
      <div className={isLoggedIn ? "pt-40" : ""}>
        <SearchSection 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          currentCategory={currentCategory}
          setCurrentCategory={setCurrentCategory}
          handleSearch={handleSearch}
          userLocation={locationCoords}
          setUserLocation={handleGetCurrentLocation}
          locating={locating}
          setLocationCoords={setLocationCoords}
        />
      </div>
      
      <section className="mt-20 container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight">Active Inquiries.</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time data stream</p>
            </div>
            {locationCoords && (
                <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl text-primary font-black text-[10px] uppercase tracking-widest border border-primary/20">
                    <Navigation size={12} /> {locationCoords.name ? `Radius: ${locationCoords.name.split(',')[0]}` : 'Proximity Filter Active (10km)'}
                </div>
            )}
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-72 rounded-[2rem] bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 animate-pulse" />
                ))}
            </div>
        ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
        ) : (
            <div className="text-center py-32 bg-white dark:bg-[#0f172a] rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-sm">
                <Search size={40} className="mx-auto text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight mb-2">Null Result.</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Adjust terminal filters to synchronize data</p>
            </div>
        )}
      </section>

      {!isLoggedIn && (
         <section className="mt-32 container mx-auto px-6 pb-20">
             <div className="bg-slate-900 dark:bg-white p-12 lg:p-20 rounded-[4rem] text-center lg:text-left relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
                 <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                     <div className="max-w-xl">
                         <h2 className="text-5xl lg:text-6xl font-black text-white dark:text-slate-900 mb-6 tracking-tighter italic">Join the Collective.</h2>
                         <p className="text-lg text-white/60 dark:text-slate-500 font-medium">Synchronize with thousands of users to reclaim what you've lost.</p>
                     </div>
                     <Link to="/signup" className="h-20 px-12 rounded-[2rem] bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-2xl flex items-center justify-center hover:scale-105 transition-all shadow-2xl no-underline">
                         Get Started
                     </Link>
                 </div>
             </div>
         </section>
      )}
    </div>
  );
}
