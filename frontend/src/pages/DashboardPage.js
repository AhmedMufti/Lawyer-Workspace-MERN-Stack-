import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { fetchCases } from '../store/slices/caseSlice';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import './DashboardPage.css';

const DashboardPage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { cases, loading: casesLoading } = useSelector((state) => state.cases);
    const { stats: dashboardStats, recentActivity: dashboardActivity, loading: dashboardLoading } = useSelector((state) => state.dashboard);

    // Lawyer Profile State
    const [hasLawyerProfile, setHasLawyerProfile] = useState(true); // Assume true initially
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileCreating, setProfileCreating] = useState(false);

    useEffect(() => {
        dispatch(fetchCases({ page: 1, limit: 5 }));
        dispatch(fetchDashboardStats());

        // Check if lawyer has a profile
        if (user?.role === 'lawyer') {
            checkLawyerProfile();
        }
    }, [dispatch, user]);

    const checkLawyerProfile = async () => {
        setProfileLoading(true);
        try {
            await api.get('/api/marketplace/profiles/me');
            setHasLawyerProfile(true);
        } catch (error) {
            if (error.response?.status === 404) {
                setHasLawyerProfile(false);
            }
        } finally {
            setProfileLoading(false);
        }
    };

    const initializeLawyerProfile = async () => {
        setProfileCreating(true);
        try {
            // Generate a unique enrollment number based on user ID and timestamp
            const uniqueEnrollment = `PLN-${user._id?.slice(-6) || 'NEW'}-${Date.now().toString().slice(-4)}`;

            await api.post('/api/marketplace/profiles', {
                primarySpecialization: 'General Practice',
                barCouncil: user.barAssociation || 'Pakistan Bar Council',
                enrollmentNumber: uniqueEnrollment,
                yearsOfExperience: user.yearsOfExperience || 0,
                isPubliclyVisible: true,
                acceptingNewClients: true
            });
            setHasLawyerProfile(true);
            alert('Your profile has been created! You will now appear in the "Find a Lawyer" section.');
        } catch (error) {
            console.error('Failed to create profile:', error);
            const errMsg = error.response?.data?.message || 'Failed to create profile. Please try again.';
            alert(errMsg);
        } finally {
            setProfileCreating(false);
        }
    };

    const stats = [
        { title: 'Total Cases', value: dashboardStats?.cases?.total || 0, icon: '📁', color: '#667eea' },
        { title: 'Active Cases', value: dashboardStats?.cases?.active || 0, icon: '⚖️', color: '#f59e0b' },
        { title: 'Upcoming Hearings', value: dashboardStats?.hearings || 0, icon: '📅', color: '#10b981' },
        { title: 'Documents', value: dashboardStats?.documents || 0, icon: '📄', color: '#ef4444' }
    ];

    const recentActivity = dashboardActivity && dashboardActivity.length > 0 ? dashboardActivity : [];

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="page-title">Welcome back, {user?.firstName}!</h1>
                        <p className="page-subtitle">Here's what's happening with your cases today</p>
                    </div>
                    {user?.role === 'lawyer' && (
                        <Link to="/dashboard/cases" className="btn btn-primary">
                            <span>+</span> New Case
                        </Link>
                    )}
                </div>

                {/* Lawyer Profile Setup Prompt */}
                {user?.role === 'lawyer' && !profileLoading && !hasLawyerProfile && (
                    <div className="profile-setup-banner" style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '12px',
                        padding: '1.5rem 2rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>
                                📋 Complete Your Public Profile
                            </h3>
                            <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                                Set up your lawyer profile so clients can find you in the "Find a Lawyer" section.
                            </p>
                        </div>
                        <button
                            onClick={initializeLawyerProfile}
                            disabled={profileCreating}
                            style={{
                                background: 'white',
                                color: '#d97706',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            {profileCreating ? 'Creating...' : 'Initialize Profile'}
                        </button>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card" style={{ '--accent-color': stat.color }}>
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-content">
                                <div className="stat-value">{dashboardLoading ? '-' : stat.value}</div>
                                <div className="stat-title">{stat.title}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-grid">
                    {/* Recent Cases */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2 className="card-title">Recent Cases</h2>
                            <Link to="/dashboard/cases" className="card-link">View All</Link>
                        </div>
                        <div className="card-content">
                            {casesLoading ? (
                                <div className="loading-state">
                                    <div className="spinner-large"></div>
                                    <p>Loading cases...</p>
                                </div>
                            ) : cases && cases.length > 0 ? (
                                <div className="cases-list">
                                    {cases.slice(0, 5).map((caseItem) => (
                                        <Link
                                            key={caseItem._id}
                                            to={`/dashboard/cases/${caseItem._id}`}
                                            className="case-item"
                                        >
                                            <div className="case-info">
                                                <div className="case-number">{caseItem.caseNumber}</div>
                                                <div className="case-title">{caseItem.caseTitle}</div>
                                            </div>
                                            <div className="case-meta">
                                                <span className={`status-badge status-${caseItem.caseStatus?.toLowerCase().replace(' ', '-')}`}>
                                                    {caseItem.caseStatus}
                                                </span>
                                                <span className="case-date">{new Date(caseItem.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📁</div>
                                    <p>No cases yet</p>
                                    <Link to="/dashboard/cases" className="btn btn-sm btn-primary">Create Your First Case</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2 className="card-title">Recent Activity</h2>
                        </div>
                        <div className="card-content">
                            {dashboardLoading ? (
                                <div className="loading-state">
                                    <div className="spinner-small"></div>
                                    <p>Loading activity...</p>
                                </div>
                            ) : recentActivity.length > 0 ? (
                                <div className="activity-list">
                                    {recentActivity.map((activity, index) => (
                                        <div key={index} className="activity-item">
                                            <div className="activity-dot"></div>
                                            <div className="activity-content">
                                                <div className="activity-action">{activity.title}</div>
                                                <div className="activity-case">{activity.subtitle}</div>
                                                <div className="activity-time">{new Date(activity.date).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="dashboard-card quick-actions-card">
                        <div className="card-header">
                            <h2 className="card-title">Quick Actions</h2>
                        </div>
                        <div className="card-content">
                            <div className="quick-actions">
                                {user?.role === 'lawyer' && (
                                    <Link to="/dashboard/cases" className="action-btn">
                                        <span className="action-icon">📁</span>
                                        <span className="action-text">New Case</span>
                                    </Link>
                                )}
                                <Link to="/research" className="action-btn">
                                    <span className="action-icon">📚</span>
                                    <span className="action-text">Legal Research</span>
                                </Link>
                                <Link to="/find-lawyers" className="action-btn">
                                    <span className="action-icon">👥</span>
                                    <span className="action-text">Find Lawyers</span>
                                </Link>
                                <Link to="/dashboard/chat" className="action-btn">
                                    <span className="action-icon">💬</span>
                                    <span className="action-text">Chat Rooms</span>
                                </Link>
                                <Link to="/marketplace" className="action-btn">
                                    <span className="action-icon">🛍️</span>
                                    <span className="action-text">Marketplace</span>
                                </Link>
                                <Link to="/dashboard/polls" className="action-btn">
                                    <span className="action-icon">📊</span>
                                    <span className="action-text">Polls & Elections</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
