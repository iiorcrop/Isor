import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TopBarSettings from './pages/TopBarSettings';
import HeaderSettings from './pages/HeaderSettings';
import MenuSettings from './pages/MenuSettings';
import NewsManagement from './pages/NewsManagement';
import BannerManagement from './pages/BannerManagement';
import QuickLinksSettings from './pages/QuickLinksSettings';
import HomeContentSettings from './pages/HomeContentSettings';
import MemberManagement from './pages/MemberManagement';
import PaymentSettings from './pages/PaymentSettings';
import CommitteeSettings from './pages/CommitteeSettings';
import JournalManagement from './pages/JournalManagement';
import ContactManagement from './pages/ContactManagement';
import Sidebar from './components/Sidebar';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
    
    return user ? children : <Navigate to="/login" />;
};

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex bg-[#0a0f1d] min-h-screen">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Dashboard Routes */}
                    <Route path="/" element={
                        <PrivateRoute>
                            <DashboardLayout><Dashboard /></DashboardLayout>
                        </PrivateRoute>
                    } />
                    
                    <Route path="/topbar" element={
                        <PrivateRoute>
                            <DashboardLayout><TopBarSettings /></DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/header" element={
                        <PrivateRoute>
                            <DashboardLayout><HeaderSettings /></DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/menu" element={
                        <PrivateRoute>
                            <DashboardLayout><MenuSettings /></DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/news" element={
                        <PrivateRoute>
                            <DashboardLayout><NewsManagement /></DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/banners" element={
                        <PrivateRoute>
                            <DashboardLayout><BannerManagement /></DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/quicklinks" element={
                        <PrivateRoute>
                            <DashboardLayout><QuickLinksSettings /></DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/home-content" element={
                        <PrivateRoute>
                            <DashboardLayout><HomeContentSettings /></DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/members" element={
                        <PrivateRoute>
                            <DashboardLayout><MemberManagement /></DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/payment-settings" element={
                        <PrivateRoute>
                            <DashboardLayout><PaymentSettings /></DashboardLayout>
                        </PrivateRoute>
                    } />

                    <Route path="/committees" element={
                        <PrivateRoute>
                            <DashboardLayout><CommitteeSettings /></DashboardLayout>
                        </PrivateRoute>
                    } />
                    
                    <Route path="/journals" element={
                        <PrivateRoute>
                            <DashboardLayout><JournalManagement /></DashboardLayout>
                        </PrivateRoute>
                    } />
                    
                    <Route path="/contact" element={
                        <PrivateRoute>
                            <DashboardLayout><ContactManagement /></DashboardLayout>
                        </PrivateRoute>
                    } />
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
