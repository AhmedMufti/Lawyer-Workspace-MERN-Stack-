import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCases } from '../store/slices/caseSlice';
import './DashboardPage.css';

const DashboardPage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { cases, loading } = useSelector((state) => state.cases);

    useEffect(() => {
        dispatch(fetchCases({ page: 1, limit: 5 }));
    }, [dispatch]);

    const stats = [
        { title: 'Total Cases', value: cases?.length || 0, icon: '📁', color: '#667eea' },
        { title: 'Active Cases', value: cases?.filter(c => c.caseStatus === 'In Progress').length || 0, icon: '⚖️', color: '#f59e0b' },
        { title: 'Upcoming Hearings', value: 0, icon: '📅', color: '#10b981' },
        { title: 'Documents', value: 0, icon: '📄', color: '#ef4444' }
    ];

    const recentActivity = [
        { action: 'Case filed', case: 'ABC vs XYZ', time: '2 hours ago' },
        { action: 'Document uploaded', case: 'DEF vs GHI', time: '5 hours ago' },
        { action: 'Hearing scheduled', case: 'JKL vs MNO', time: '1 day ago' }
    ];

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="page-title">Welcome back, {user?.firstName}!</h1>
                        <p className="page-subtitle">Here's what's happening with your cases today</p>
                    </div>
                    <Link to="/dashboard/cases" className="btn btn-primary">
                        <span>+</span> New Case
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card" style={{ '--accent-color': stat.color }}>
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.value}</div>
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
                            {loading ? (
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
                            <div className="activity-list">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-dot"></div>
                                        <div className="activity-content">
                                            <div className="activity-action">{activity.action}</div>
                                            <div className="activity-case">{activity.case}</div>
                                            <div className="activity-time">{activity.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="dashboard-card quick-actions-card">
                        <div className="card-header">
                            <h2 className="card-title">Quick Actions</h2>
                        </div>
                        <div className="card-content">
                            <div className="quick-actions">
                                <Link to="/dashboard/cases" className="action-btn">
                                    <span className="action-icon">📁</span>
                                    <span className="action-text">New Case</span>
                                </Link>
                                <Link to="/research" className="action-btn">
                                    <span className="action-icon">📚</span>
                                    <span className="action-text">Legal Research</span>
                                </Link>
                                <Link to="/marketplace" className="action-btn">
                                    <span className="action-icon">👥</span>
                                    <span className="action-text">Find Lawyers</span>
                                </Link>
                                <Link to="/dashboard/chat" className="action-btn">
                                    <span className="action-icon">💬</span>
                                    <span className="action-text">Chat Rooms</span>
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
