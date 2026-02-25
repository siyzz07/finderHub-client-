import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileText, Heart, Bell, Settings, LogOut,
  Plus, Search, Filter, MoreVertical, MapPin, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'posts', name: 'My Posts', icon: <FileText size={20} /> },
    { id: 'claims', name: 'My Claims', icon: <Heart size={20} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={20} /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-full lg:w-72 space-y-2">
      <div className="glass p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-xl font-black uppercase">
          {user.username?.[0] || 'U'}
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{user.username}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Member</p>
        </div>
      </div>
      
      <div className="glass p-3 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all border-none cursor-pointer ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {item.icon}
            {item.name}
            {item.id === 'notifications' && (
              <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">3</span>
            )}
          </button>
        ))}
      </div>

      <button 
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-8 py-4 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border-none bg-transparent cursor-pointer mt-8"
      >
        <LogOut size={20} /> Sign Out
      </button>
    </div>
  );
};

import { apiRequest } from '../utils/api';

const PostItem = ({ item, onStatusUpdate }) => {
  const statusColors = {
    Approved: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    Pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    Found: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    Returned: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    Claimed: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  };

  const isApproved = item.isApproved;
  const displayStatus = !isApproved ? 'Pending' : item.status;

  const getActionButton = () => {
    if (!isApproved) return null;
    if (item.status === 'Lost') {
      return (
        <button 
          onClick={() => onStatusUpdate(item._id, 'Found')}
          className="text-[10px] font-bold text-emerald-500 border border-emerald-500/30 bg-emerald-500/5 px-2 py-1 rounded-lg hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
        >
          Mark as Found
        </button>
      );
    }
    if (item.status === 'Found') {
      return (
        <button 
          onClick={() => onStatusUpdate(item._id, 'Returned')}
          className="text-[10px] font-bold text-emerald-500 border border-emerald-500/30 bg-emerald-500/5 px-2 py-1 rounded-lg hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
        >
          Mark as Returned
        </button>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-4 flex flex-col sm:flex-row gap-4 items-center group relative"
    >
      <img src={item.images?.[0] || item.image} className="w-20 h-20 rounded-xl object-cover" alt="" />
      <div className="flex-grow w-full">
        <div className="flex justify-between items-start">
          <h4 className="font-bold">{item.title}</h4>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border ${statusColors[displayStatus] || 'text-slate-500 border-slate-200'}`}>
            {displayStatus}
          </span>
        </div>
        <p className="text-xs text-muted flex items-center gap-1 mt-1">
          <MapPin size={12} /> {item.location}
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-3">
          <p className="text-[10px] font-bold text-muted flex items-center gap-1 uppercase">
            <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}
          </p>
          <div className="flex gap-2 ml-auto">
            {getActionButton()}
            <button className="text-[10px] font-bold text-primary border-none bg-transparent cursor-pointer hover:underline">Edit Post</button>
          </div>
        </div>
      </div>
      <button className="p-2 rounded-lg glass text-muted hover:text-primary transition-all border-none cursor-pointer hidden sm:block">
        <MoreVertical size={18} />
      </button>
    </motion.div>
  );
};

const Overview = ({ posts, loading, onStatusUpdate }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: 'Total Posts', value: posts.length, color: 'primary' },
        { label: 'Approved', value: posts.filter(p => p.isApproved).length, color: 'teal-500' },
        { label: 'Resolved', value: posts.filter(p => p.status === 'Found' || p.status === 'Returned').length, color: 'emerald-500' },
      ].map((stat, i) => (
        <div key={i} className="glass p-6">
           <p className="text-sm font-bold text-muted mb-2">{stat.label}</p>
           <p className={`text-4xl font-extrabold text-${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center justify-between">
          Recent Activity
          <button className="text-sm text-primary font-bold bg-transparent border-none cursor-pointer">View All</button>
        </h3>
        <div className="space-y-4">
           {loading ? (
             <div className="p-8 text-center text-muted">Loading posts...</div>
           ) : posts.length > 0 ? (
             posts.slice(0, 3).map(post => <PostItem key={post._id} item={post} onStatusUpdate={onStatusUpdate} />)
           ) : (
             <div className="p-8 text-center text-muted italic">No posts found.</div>
           )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Recommended for You</h3>
        <div className="glass p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Search size={32} />
          </div>
          <p className="font-bold">No new matches found</p>
          <p className="text-sm text-muted">We'll notify you if an item matches your lost reports.</p>
          <button className="btn-primary py-2 px-6 text-sm">Update Filters</button>
        </div>
      </div>
    </div>
  </div>
);

const PostsContent = ({ posts, loading, onStatusUpdate }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Reported Items</h2>
            <button className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                <Plus size={16} /> New Report
            </button>
        </div>
        <div className="grid gap-4">
            {loading ? (
                <div className="p-12 text-center text-muted">Loading your items...</div>
            ) : posts.length > 0 ? (
                posts.map(post => <PostItem key={post._id} item={post} onStatusUpdate={onStatusUpdate} />)
            ) : (
                <div className="glass p-12 text-center text-muted italic">You haven't reported any items yet.</div>
            )}
        </div>
    </div>
);

const ClaimsContent = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Claim Requests</h2>
            <div className="flex gap-2">
                 <button className="glass p-2 border-none cursor-pointer"><Filter size={18}/></button>
                 <button className="btn-primary py-2 px-4 text-sm"><Plus size={16}/> New Claim</button>
            </div>
       </div>
       <div className="grid gap-4">
          {[
            { title: 'MacBook Pro 14"', status: 'Pending Review', id: '#CL-8921', date: 'Feb 16, 2026', owner: 'Tech Park Cafe' },
            { title: 'Identity Card', status: 'Approved', id: '#CL-7712', date: 'Feb 12, 2026', owner: 'John Doe' },
            { title: 'Reading Glasses', status: 'Rejected', id: '#CL-6651', date: 'Feb 05, 2026', owner: 'Library Staff' }
          ].map((claim, i) => (
            <div key={i} className="glass p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        claim.status === 'Approved' ? 'bg-teal-500/10 text-teal-500' : 
                        claim.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                    }`}>
                        {claim.status === 'Approved' ? <CheckCircle /> : claim.status === 'Rejected' ? <XCircle /> : <Clock />}
                    </div>
                    <div>
                        <h4 className="font-bold">{claim.title}</h4>
                        <p className="text-xs text-muted">Claim ID: {claim.id} • Requested from: {claim.owner}</p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-muted uppercase">Status</p>
                        <p className={`text-sm font-bold ${
                            claim.status === 'Approved' ? 'text-teal-500' : 
                            claim.status === 'Rejected' ? 'text-red-500' : 'text-primary'
                        }`}>{claim.status}</p>
                    </div>
                    <button className="glass px-4 py-2 text-sm font-bold border-none cursor-pointer">View Details</button>
                </div>
            </div>
          ))}
       </div>
    </div>
)

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const fetchMyPosts = async () => {
    try {
      const response = await apiRequest('/items/my-items', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching my posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleLogout = () => {
    googleLogout();
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await apiRequest(`/items/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchMyPosts(); // Refresh list
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
        
        <div className="flex-grow">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">Welcome back, {user.username || 'User'}!</h1>
              <p className="text-slate-500 font-medium">Manage your reports and track your claims efficiently.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Search dashboard..." className="glass pl-10 pr-4 py-2 text-sm border-none outline-none focus:ring-1 ring-primary w-64 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.2 }}
             >
               {activeTab === 'overview' && <Overview posts={posts} loading={loading} onStatusUpdate={handleStatusUpdate} />}
               {activeTab === 'posts' && <PostsContent posts={posts} loading={loading} onStatusUpdate={handleStatusUpdate} />}
               {activeTab === 'claims' && <ClaimsContent />}
               {activeTab !== 'overview' && activeTab !== 'posts' && activeTab !== 'claims' && (
                 <div className="glass p-20 text-center space-y-4">
                    <h2 className="text-2xl font-bold">Section under construction</h2>
                    <p className="text-muted">We're working hard to bring this feature to you.</p>
                 </div>
               )}
             </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
