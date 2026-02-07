import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { FaUser, FaBriefcase, FaMapMarkerAlt, FaUniversity, FaStar, FaPhone, FaEnvelope } from 'react-icons/fa';
import './LawyerPublicProfilePage.css';

const LawyerPublicProfilePage = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/api/marketplace/profiles/${id}`);
                setProfile(response.data.data.profile);
            } catch (err) {
                setError('Profile not found');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!profile) return <div className="error-message">Profile not found</div>;

    const { user } = profile;

    return (
        <div className="lawyer-public-profile">
            <div className="container">
                <Link to="/find-lawyers" className="back-link">&larr; Back to Search</Link>

                <div className="profile-header-card">
                    <div className="profile-cover"></div>
                    <div className="profile-main-info">
                        <div className="profile-avatar-large">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                        <div className="info-text">
                            <h1>{user?.firstName} {user?.lastName}</h1>
                            <p className="headline">{profile.professionalTitle}</p>
                            <p className="location"><FaMapMarkerAlt /> {profile.officeAddress?.city || 'Pakistan'}</p>

                            <div className="badges">
                                <span className="badge specialization">{profile.primarySpecialization}</span>
                                <span className="badge experience">{profile.yearsOfExperience} Years Exp.</span>
                            </div>
                        </div>
                        <div className="action-buttons">
                            <button className="btn btn-primary">Contact Lawyer</button>
                        </div>
                    </div>
                </div>

                <div className="profile-content-grid">
                    <div className="main-column">
                        <section className="profile-section">
                            <h2>About</h2>
                            <p className="bio-text">{profile.bio || 'No biography provided.'}</p>
                        </section>

                        <section className="profile-section">
                            <h2>Education & Bar Admission</h2>
                            <div className="detail-row">
                                <FaUniversity className="icon" />
                                <div>
                                    <strong>Bar Council</strong>
                                    <p>{profile.barCouncil}</p>
                                </div>
                            </div>
                            <div className="detail-row">
                                <FaBriefcase className="icon" />
                                <div>
                                    <strong>License Status</strong>
                                    <p>{profile.licenseStatus}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="sidebar-column">
                        <section className="profile-section compact">
                            <h3>Contact Info</h3>
                            <div className="contact-item">
                                <FaEnvelope />
                                <span>{profile.officeEmail || user.email}</span>
                            </div>
                            {profile.officePhone && (
                                <div className="contact-item">
                                    <FaPhone />
                                    <span>{profile.officePhone}</span>
                                </div>
                            )}
                        </section>

                        <section className="profile-section compact">
                            <h3>Details</h3>
                            <div className="stat-item">
                                <span className="label">Consultation Fee</span>
                                <span className="value">PKR {profile.consultation?.fee || 'Contact for price'}</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Rating</span>
                                <span className="value"><FaStar className="star-yellow" /> {profile.averageRating} ({profile.totalReviews} reviews)</span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerPublicProfilePage;
