import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">Pakistan Legal Nexus</h1>
                        <p className="hero-subtitle">
                            Your Complete Legal Management Platform
                        </p>
                        <p className="hero-description">
                            Manage cases, access legal research, connect with lawyers, and more - all in one powerful platform.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/register" className="btn btn-large btn-primary">
                                Get Started Free
                            </Link>
                            <Link to="/research" className="btn btn-large btn-outline">
                                Explore Research
                            </Link>
                        </div>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-card">
                            <div className="stat-number">83</div>
                            <div className="stat-label">API Endpoints</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">16</div>
                            <div className="stat-label">Database Models</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">9</div>
                            <div className="stat-label">Languages</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Complete Legal Solution</h2>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📁</div>
                            <h3>Case Management</h3>
                            <p>Manage all your legal cases with document uploads, hearing tracking, and team collaboration.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📚</div>
                            <h3>Legal Research</h3>
                            <p>Access comprehensive database of Acts, Case Laws, and Court Forms with advanced search.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">👥</div>
                            <h3>Professional Network</h3>
                            <p>Find lawyers, law firms, and legal professionals. View profiles, ratings, and reviews.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h3>Bar Chat Rooms</h3>
                            <p>Connect with bar members in dedicated chat rooms with real-time messaging.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🗳️</div>
                            <h3>Elections & Polling</h3>
                            <p>Participate in bar elections and opinion polls with vote changing capability.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💳</div>
                            <h3>Secure Payments</h3>
                            <p>JazzCash and EasyPaisa integration for subscription management and transactions.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Transform Your Legal Practice?</h2>
                        <p>Join thousands of legal professionals using Pakistan Legal Nexus</p>
                        <Link to="/register" className="btn btn-large btn-primary">
                            Start Your Free Trial
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
