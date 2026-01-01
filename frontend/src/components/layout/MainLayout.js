import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';
import './MainLayout.css';
import { FaGlobe } from 'react-icons/fa';

const MainLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ur' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="main-layout">
            <header className="main-header">
                <div className="container header-content">
                    <Link to="/" className="logo">
                        <h1>⚖️ {t('welcome', { defaultValue: 'Pakistan Legal Nexus' })}</h1>
                    </Link>

                    <nav className="main-nav">
                        <Link to="/" className="nav-link">{t('welcome', { defaultValue: 'Home' }).split(' ')[0]}</Link>


                        <button className="btn btn-sm btn-outline lang-btn" onClick={toggleLanguage} style={{ display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '20px' }}>
                            <FaGlobe /> {i18n.language === 'en' ? 'اردو' : 'English'}
                        </button>

                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="nav-link">{t('dashboard', { defaultValue: 'Dashboard' })}</Link>
                                <div className="user-menu">
                                    <span className="user-name">{user?.firstName} {user?.lastName}</span>
                                    <span className="user-role">({user?.role})</span>
                                    <button onClick={handleLogout} className="btn btn-outline">{t('logout', { defaultValue: 'Logout' })}</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline">{t('login', { defaultValue: 'Login' })}</Link>
                                <Link to="/register" className="btn btn-primary">{t('register', { defaultValue: 'Register' })}</Link>
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
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
