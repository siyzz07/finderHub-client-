import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ItemDetails from '../pages/ItemDetails';
import UserDashboard from '../pages/UserDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AdminLogin from '../pages/AdminLogin';

const ProtectedAdminRoute = ({ children }) => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const isLoggedIn = !!sessionStorage.getItem('accessToken');
    
    if (!isLoggedIn || user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }
    
    return children;
};

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route 
                path="/admin" 
                element={
                    <ProtectedAdminRoute>
                        <AdminDashboard />
                    </ProtectedAdminRoute>
                } 
            />
            <Route path="/explore" element={<Home showMapOnly={true} />} />
        </Routes>
    );
};

export default AppRouter;
