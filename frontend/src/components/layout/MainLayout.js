import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';
import Footer from './Footer';
import './MainLayout.css';
import {
    FaGlobe,
    FaBars,
    FaTimes,
    FaUser,
    FaSignOutAlt,
    FaHome,
    FaTachometerAlt,
    FaSearch,
    FaStore,
    FaComments
} from 'react-icons/fa';

const MainLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
        setMobileMenuOpen(false);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ur' : 'en';
        i18n.changeLanguage(newLang);
    };

    const closeMenus = () => {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
    };

    return (
        <div className="main-layout">
            <header className="main-header">
                <div className="header-container">
                    {/* Logo */}
                    <Link to="/" className="logo" onClick={closeMenus}>
                        <span className="logo-icon">⚖️</span>
                        <div className="logo-text">
                            <span className="logo-title">Pakistan Legal Nexus</span>
                            <span className="logo-subtitle">Justice Through Technology</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        <Link to="/" className="nav-link">
                            <FaHome /> Home
                        </Link>
                        <Link to="/find-lawyers" className="nav-link">
                            <FaSearch /> Find Lawyers
                        </Link>
                        <Link to="/marketplace" className="nav-link">
                            <FaStore /> Marketplace
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard" className="nav-link">
                                    <FaTachometerAlt /> Dashboard
                                </Link>
                                <Link to="/dashboard/chat" className="nav-link">
                                    <FaComments /> Chat
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Right Section */}
                    <div className="header-right">
                        {/* Language Toggle */}
                        <button className="lang-toggle" onClick={toggleLanguage} title="Toggle Language">
                            <FaGlobe />
                            <span>{i18n.language === 'en' ? 'اردو' : 'EN'}</span>
                        </button>

                        {isAuthenticated ? (
                            /* User Menu */
                            <div className="user-menu-wrapper">
                                <button
                                    className="user-menu-trigger"
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                >
                                    <div className="user-avatar">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </div>
                                    <div className="user-info">
                                        <span className="user-name">{user?.firstName} {user?.lastName}</span>
                                        <span className="user-role">{user?.role}</span>
                                    </div>
                                </button>

                                {userDropdownOpen && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-header">
                                            <div className="dropdown-avatar">
                                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="dropdown-name">{user?.firstName} {user?.lastName}</div>
                                                <div className="dropdown-email">{user?.email}</div>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <Link to="/dashboard/profile" className="dropdown-item" onClick={closeMenus}>
                                            <FaUser /> My Profile
                                        </Link>
                                        <Link to="/dashboard" className="dropdown-item" onClick={closeMenus}>
                                            <FaTachometerAlt /> Dashboard
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item logout" onClick={handleLogout}>
                                            <FaSignOutAlt /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Auth Buttons */
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-ghost">Login</Link>
                                <Link to="/register" className="btn btn-primary">Register</Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="mobile-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link to="/" className="mobile-link" onClick={closeMenus}>
                        <FaHome /> Home
                    </Link>
                    <Link to="/find-lawyers" className="mobile-link" onClick={closeMenus}>
                        <FaSearch /> Find Lawyers
                    </Link>
                    <Link to="/marketplace" className="mobile-link" onClick={closeMenus}>
                        <FaStore /> Marketplace
                    </Link>
                    {isAuthenticated && (
                        <>
                            <Link to="/dashboard" className="mobile-link" onClick={closeMenus}>
                                <FaTachometerAlt /> Dashboard
                            </Link>
                            <Link to="/dashboard/chat" className="mobile-link" onClick={closeMenus}>
                                <FaComments /> Chat
                            </Link>
                            <Link to="/dashboard/profile" className="mobile-link" onClick={closeMenus}>
                                <FaUser /> My Profile
                            </Link>
                            <div className="mobile-divider"></div>
                            <button className="mobile-link logout" onClick={handleLogout}>
                                <FaSignOutAlt /> Logout
                            </button>
                        </>
                    )}
                    {!isAuthenticated && (
                        <div className="mobile-auth">
                            <Link to="/login" className="btn btn-ghost full-width" onClick={closeMenus}>Login</Link>
                            <Link to="/register" className="btn btn-primary full-width" onClick={closeMenus}>Register</Link>
                        </div>
                    )}
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <Footer />

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMenus}></div>}
        </div>
    );
};

export default MainLayout;
