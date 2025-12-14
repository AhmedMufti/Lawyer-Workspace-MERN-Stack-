import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './MainLayout.css';

const MainLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="main-layout">
            <header className="main-header">
                <div className="container header-content">
                    <Link to="/" className="logo">
                        <h1>⚖️ Pakistan Legal Nexus</h1>
                    </Link>

                    <nav className="main-nav">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/research" className="nav-link">Legal Research</Link>
                        <Link to="/marketplace" className="nav-link">Marketplace</Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                <Link to="/dashboard/cases" className="nav-link">Cases</Link>
                                <Link to="/dashboard/chat" className="nav-link">Chat</Link>
                                <Link to="/dashboard/polls" className="nav-link">Polls</Link>
                                <div className="user-menu">
                                    <span className="user-name">{user?.firstName} {user?.lastName}</span>
                                    <span className="user-role">({user?.role})</span>
                                    <button onClick={handleLogout} className="btn btn-outline">Logout</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline">Login</Link>
                                <Link to="/register" className="btn btn-primary">Register</Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="main-footer">
                <div className="container">
                    <p>&copy; 2025 Pakistan Legal Nexus. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
