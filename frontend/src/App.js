import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/cases/CasesPage';
import CaseDetailPage from './pages/cases/CaseDetailPage';
import ResearchPage from './pages/research/ResearchPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import LawyerPublicProfilePage from './pages/marketplace/LawyerPublicProfilePage';
import FindLawyersPage from './pages/FindLawyersPage';
import ChatPage from './pages/chat/ChatPage';
import PollsPage from './pages/polls/PollsPage';
import ProfilePage from './pages/profile/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className="App">
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="research" element={<ResearchPage />} />
                    <Route path="marketplace" element={<MarketplacePage />} />
                    <Route path="find-lawyers" element={<FindLawyersPage />} />
                    <Route path="lawyer/:id" element={<LawyerPublicProfilePage />} />
                </Route>

                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
                    <Route path="register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
                </Route>

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route index element={<DashboardPage />} />
                    <Route path="cases" element={<CasesPage />} />
                    <Route path="cases/:id" element={<CaseDetailPage />} />
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="polls" element={<PollsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;
