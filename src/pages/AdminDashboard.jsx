import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Activity, Users, FileCheck, AlertCircle, 
  Check, X, Eye, Filter, Download, MoreHorizontal,
  Calendar, ArrowUpRight, ArrowDownRight, RefreshCw,
  ShieldCheck, LayoutDashboard, Flag, Settings, LogOut,
  ChevronRight, Search, MapPin, Layers, Timer, Bell,
  Shield, ExternalLink, Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { apiRequest } from '../utils/api';

const SidebarItem = ({ id, name, icon, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-none cursor-pointer relative ${
            activeTab === id 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/5' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
        }`}
    >
        {icon}
        {name}
        {activeTab === id && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
);

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-[#0f172a] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none group hover:border-primary/50 transition-all">
        <div className="flex justify-between items-start mb-8">
            <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-${color} group-hover:scale-110 transition-transform shadow-sm`}>
                {icon}
            </div>
            <div className={`px-3 py-1 bg-${color}/5 text-${color} text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5`}>
                <div className={`w-1.5 h-1.5 rounded-full bg-${color} animate-pulse`} /> Live
            </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{title}</p>
        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">{value}</p>
    </div>
);

const ApprovalRow = ({ item, onApprove, onReject }) => (
    <tr className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
        <td className="px-8 py-6">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm relative">
                    <img src={item.images?.[0] || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors" />
                </div>
                <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                    <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md ${item.type === 'Lost' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                            {item.type}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.category}</span>
                    </div>
                </div>
            </div>
        </td>
        <td className="px-8 py-6">
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold text-xs">
                <MapPin size={14} className="text-primary/70" />
                {item.location}
            </div>
        </td>
        <td className="px-8 py-6">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white text-[10px] font-black">
                     {item.poster?.username?.[0] || 'U'}
                 </div>
                 <span className="font-bold text-xs text-slate-600 dark:text-slate-400">@{item.poster?.username || 'user'}</span>
             </div>
        </td>
        <td className="px-8 py-6 text-right">
            <div className="flex justify-end gap-3">
                <button 
                    onClick={() => onApprove(item._id)}
                    className="h-10 px-6 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all border-none cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                    Approve
                </button>
                <button 
                    onClick={() => onReject(item._id)}
                    className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                >
                    Reject
                </button>
            </div>
        </td>
    </tr>
);

const GeneralRow = ({ item, onDelete }) => (
    <tr className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
        <td className="px-8 py-6">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm relative">
                    <img src={item.images?.[0] || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
                <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                    <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md ${item.type === 'Lost' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                            {item.type}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest p-0.5 px-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-md">Status: {item.status}</span>
                    </div>
                </div>
            </div>
        </td>
        <td className="px-8 py-6">
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                {item.category}
            </div>
        </td>
        <td className="px-8 py-6">
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold text-xs truncate max-w-[150px]">
                <MapPin size={14} className="text-primary" />
                {item.location}
            </div>
        </td>
        <td className="px-8 py-6">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white text-[10px] font-black">
                     {item.poster?.username?.[0] || 'U'}
                 </div>
                 <span className="font-bold text-xs text-slate-600 dark:text-slate-400 truncate max-w-[80px]">@{item.poster?.username || 'user'}</span>
             </div>
        </td>
        <td className="px-8 py-6 text-right">
            <button 
                onClick={() => onDelete(item._id)}
                className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
            >
                Archive
            </button>
        </td>
    </tr>
);

const UserRow = ({ user }) => (
    <tr className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
        <td className="px-10 py-6">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                    {user.username?.[0] || 'U'}
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{user.username}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{user.role}</p>
                </div>
            </div>
        </td>
        <td className="px-10 py-6">
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold text-xs">
                <Mail size={14} className="text-primary/70" />
                {user.email}
            </div>
        </td>
        <td className="px-10 py-6">
             <div className="flex items-center gap-3">
                 <span className="font-bold text-xs text-slate-600 dark:text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                 </span>
             </div>
        </td>
        <td className="px-10 py-6 text-right">
            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {user.role}
            </span>
        </td>
    </tr>
);

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalUsers: 0, totalLost: 0, resolvedItems: 0 });
    const [pendingItems, setPendingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [allItems, setAllItems] = useState([]);
    const [users, setUsers] = useState([]);
 
    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, pendingRes, allRes, usersRes] = await Promise.all([
                apiRequest('/items/admin/stats'),
                apiRequest('/items?isApproved=false', {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
                }),
                apiRequest('/items?isApproved=true', {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
                }),
                apiRequest('/auth/users', {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
                })
            ]);
            
            if (statsRes.ok) setStats(await statsRes.json());
            if (pendingRes.ok) setPendingItems(await pendingRes.json());
            if (allRes.ok) setAllItems(await allRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleApprove = async (id) => {
        try {
            const res = await apiRequest(`/items/${id}/approve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
            });
            if (res.ok) {
                fetchData();
            } else {
                const data = await res.json();
                alert(`Approval failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Approval error:', error);
            alert('Connection failed during approval.');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject and permanently delete this report?")) return;
        try {
            const res = await apiRequest(`/items/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
            });
            if (res.ok) {
                fetchData();
            } else {
                const data = await res.json();
                alert(`Rejection failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Rejection error:', error);
            alert('Connection failed during rejection.');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleLogout = () => {
        googleLogout();
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#020617] transition-colors duration-500 pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-[1400px]">
                <div className="flex flex-col xl:flex-row gap-12">
                    {/* Clean Sidebar */}
                    <div className="w-full xl:w-72 flex-shrink-0">
                        <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] p-4 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8">
                
                             
                             <div className="space-y-1">
                                <SidebarItem id="overview" name="Overview" icon={<LayoutDashboard size={18}/>} activeTab={activeTab} setActiveTab={setActiveTab} />
                                <SidebarItem id="discovery" name="Lost Items" icon={<Layers size={18}/>} activeTab={activeTab} setActiveTab={setActiveTab} />
                                <SidebarItem id="verification" name="Approvals" icon={<Flag size={18}/>} activeTab={activeTab} setActiveTab={setActiveTab} />
                                <SidebarItem id="users" name="Users" icon={<Users size={18}/>} activeTab={activeTab} setActiveTab={setActiveTab} />
                                {/* <SidebarItem id="security" name="System" icon={<ShieldCheck size={18}/>} activeTab={activeTab} setActiveTab={setActiveTab} /> */}
                             </div>
                        </div>

                        <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
                          
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer">
                                <LogOut size={14} /> Exit Admin
                            </button>
                        </div>
                    </div>

                    {/* Content Hub */}
                    <div className="flex-grow">
                        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 h-fit min-h-[140px]">
                            <div>
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">Central Intelligence</span>
                                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic mb-4 capitalize">{activeTab} <span className="text-slate-300 dark:text-slate-800 not-italic">Center.</span></h1>
                                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg">Manage platform flow, verify community reports, and monitor system integrity.</p>
                            </div>
                        </header>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                            <StatCard title="Active Collective" value={stats.totalUsers.toLocaleString()} icon={<Users size={28} />} color="blue-500" />
                                            <StatCard title="Open Reports" value={stats.totalLost.toLocaleString()} icon={<AlertCircle size={28} />} color="red-500" />
                                            <StatCard title="Successful Returns" value={stats.resolvedItems.toLocaleString()} icon={<Check size={28} />} color="emerald-500" />
                                            <StatCard title="Pending Validation" value={(stats.pendingRequests || 0).toLocaleString()} icon={<Flag size={28} />} color="amber-500" />
                                        </div>

                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between px-4">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">Pending Verification.</h3>
                                                <button onClick={() => setActiveTab('verification')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2">View Full Queue <ExternalLink size={12}/></button>
                                            </div>
                                            <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800/50 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800/50">
                                                            <th className="px-8 py-6">Asset Discovery</th>
                                                            <th className="px-8 py-6">Zone Node</th>
                                                            <th className="px-8 py-6">Identity</th>
                                                            <th className="px-8 py-6 text-right">Protocol</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                        {pendingItems.slice(0, 5).map(item => (
                                                            <ApprovalRow key={item._id} item={item} onApprove={handleApprove} onReject={handleReject} />
                                                        ))}
                                                        {pendingItems.length === 0 && !loading && (
                                                            <tr>
                                                                <td colSpan="4" className="px-8 py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                                                     All reports processed • Synchronization 100%
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {loading && (
                                                             <tr>
                                                                 <td colSpan="4" className="px-8 py-32 text-center">
                                                                     <RefreshCw className="animate-spin inline-block text-slate-300" size={32} />
                                                                 </td>
                                                             </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'discovery' && (
                                    <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800/50 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                                        <div className="p-10 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                                             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Lost Items Hub.</h3>
                                             <div className="flex gap-3">
                                                 <button className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 flex items-center gap-2 hover:text-slate-900 dark:hover:text-white border-none cursor-pointer"><Filter size={18}/> Filter</button>
                                                 <button className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 flex items-center justify-center hover:text-slate-900 dark:hover:text-white border-none cursor-pointer"><Search size={18}/></button>
                                             </div>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800/50">
                                                    <th className="px-10 py-6">Asset Discovery</th>
                                                    <th className="px-10 py-6">Category</th>
                                                    <th className="px-10 py-6">Location Node</th>
                                                    <th className="px-10 py-6">Identity</th>
                                                    <th className="px-10 py-6 text-right">Central Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allItems.filter(item => item.type === 'Lost').map(item => (
                                                    <GeneralRow key={item._id} item={item} onDelete={handleReject} />
                                                ))}
                                                {allItems.filter(item => item.type === 'Lost').length === 0 && !loading && (
                                                    <tr>
                                                        <td colSpan="5" className="px-10 py-40 text-center">
                                                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-200 dark:text-slate-800 mb-6">
                                                                <Layers size={40} />
                                                            </div>
                                                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No active signals found.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 'verification' && (
                                    <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800/50 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                                        <div className="p-10 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                                             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Approval Queue.</h3>
                                             <div className="flex gap-3">
                                                 <button className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 flex items-center justify-center hover:text-slate-900 dark:hover:text-white border-none cursor-pointer"><Filter size={18}/></button>
                                                 <button className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 flex items-center justify-center hover:text-slate-900 dark:hover:text-white border-none cursor-pointer"><Search size={18}/></button>
                                             </div>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800/50">
                                                    <th className="px-10 py-6">Asset Discovery</th>
                                                    <th className="px-10 py-6">Location Node</th>
                                                    <th className="px-10 py-6">Identity</th>
                                                    <th className="px-10 py-6 text-right">Verification Protocol</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingItems.map(item => (
                                                    <ApprovalRow key={item._id} item={item} onApprove={handleApprove} onReject={handleReject} />
                                                ))}
                                                {pendingItems.length === 0 && !loading && (
                                                    <tr>
                                                        <td colSpan="4" className="px-10 py-40 text-center">
                                                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-200 dark:text-slate-800 mb-6">
                                                                <Check size={40} />
                                                            </div>
                                                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Database queue empty.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 'users' && (
                                    <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800/50 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                                        <div className="p-10 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                                             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Registered Users.</h3>
                                             <div className="flex gap-3">
                                                 <button className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 flex items-center gap-2 hover:text-slate-900 dark:hover:text-white border-none cursor-pointer"><Users size={18}/> {users.length} Registered</button>
                                             </div>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800/50">
                                                    <th className="px-10 py-6">Identifier</th>
                                                    <th className="px-10 py-6">Communication Node</th>
                                                    <th className="px-10 py-6">Origin Date</th>
                                                    <th className="px-10 py-6 text-right">Clearance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(user => (
                                                    <UserRow key={user._id} user={user} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800/50 rounded-[3rem] p-40 text-center space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                             <ShieldCheck size={48} />
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic mb-3">System Integrity.</h3>
                                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">All security protocols operating at peak efficiency.</p>
                                        </div>
                                        <button onClick={() => setActiveTab('overview')} className="h-14 px-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 border-none cursor-pointer">Return to Dashboard</button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
