import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaSearch, FaMapMarkerAlt, FaStar, FaBriefcase, FaUniversity, FaPhone } from 'react-icons/fa';
import './FindLawyersPage.css';

const FindLawyersPage = () => {
    const navigate = useNavigate();
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        city: '',
        specialization: ''
    });

    const fetchLawyers = async () => {
        setLoading(true);
        try {
            let response;

            // Use search endpoint if searching, otherwise get all profiles
            if (searchQuery || filters.city || filters.specialization) {
                const params = {
                    query: searchQuery,
                    ...filters,
                    limit: 20
                };
                const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v));
                response = await api.get('/api/marketplace/profiles/search', { params: cleanParams });
            } else {
                response = await api.get('/api/marketplace/profiles', { params: { limit: 20 } });
            }

            setLawyers(response.data.data.profiles || response.data.data || []);
        } catch (error) {
            console.error('Error fetching lawyers:', error);
            setLawyers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLawyers();
    }, [filters]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLawyers();
    };

    const handleContact = async (userId) => {
        if (!userId) {
            alert('Lawyer contact info unavailable.');
            return;
        }
        try {
            const response = await api.post('/api/chat/rooms/dm', { targetUserId: userId });
            const roomId = response.data.data.room._id;
            navigate(`/dashboard/chat?roomId=${roomId}`);
        } catch (error) {
            console.error('Failed to start chat:', error);
            if (error.response?.status === 401) {
                alert('Please login to contact lawyers.');
                navigate('/login');
            } else if (error.response?.status === 404) {
                alert('This account no longer exists.');
            } else {
                alert('Could not start chat. Please try again later.');
            }
        }
    };

    return (
        <div className="find-lawyers-page">
            <div className="container">
                <div className="page-header text-center">
                    <h1 className="page-title">Find a Lawyer</h1>
                    <p className="page-subtitle">Connect with top legal professionals across Pakistan</p>
                </div>

                {/* Search & Filters */}
                <div className="search-container card-glass">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-group">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name, specialization..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <input
                            placeholder="City (e.g. Lahore)"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            className="filter-input"
                        />
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-large"></div>
                        <p>Finding legal experts...</p>
                    </div>
                ) : (
                    <div className="lawyers-grid">
                        {lawyers.length > 0 ? (
                            lawyers.map((lawyer) => (
                                <div key={lawyer._id} className="lawyer-card card-glass">
                                    <div className="lawyer-header">
                                        <div className="lawyer-avatar">
                                            {lawyer.user?.firstName?.charAt(0) || 'L'}
                                        </div>
                                        <div className="lawyer-info">
                                            <h3>{lawyer.user?.firstName} {lawyer.user?.lastName}</h3>
                                            <span className="specialization-badge">{lawyer.specialization || 'General Practice'}</span>
                                        </div>
                                    </div>

                                    <div className="lawyer-details">
                                        <div className="detail-item">
                                            <FaMapMarkerAlt className="icon" />
                                            <span>{lawyer.city || 'Pakistan'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <FaBriefcase className="icon" />
                                            <span>{lawyer.yearsOfExperience || 0} Years Exp.</span>
                                        </div>
                                        <div className="detail-item">
                                            <FaUniversity className="icon" />
                                            <span>{lawyer.barAssociation || 'Bar Association'}</span>
                                        </div>
                                    </div>

                                    <div className="lawyer-footer">
                                        <div className="rating">
                                            <FaStar className="star-icon" />
                                            <span>{lawyer.rating || 'New'}</span>
                                            <span className="review-count">({lawyer.reviewCount || 0} reviews)</span>
                                        </div>
                                        <div className="lawyer-actions">
                                            <button
                                                onClick={() => handleContact(lawyer.user?._id)}
                                                className="btn btn-primary btn-sm"
                                                disabled={!lawyer.user?._id}
                                                style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <FaPhone /> Contact
                                            </button>
                                            <button onClick={() => navigate(`/lawyer/${lawyer._id}`)} className="btn btn-outline btn-sm">View Profile</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🔍</div>
                                <h3>No lawyers found</h3>
                                <p>Try adjusting your search filters.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindLawyersPage;
