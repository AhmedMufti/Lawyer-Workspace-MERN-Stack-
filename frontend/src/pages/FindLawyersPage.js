import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaMapMarkerAlt, FaStar, FaBriefcase, FaUniversity, FaPhone } from 'react-icons/fa';
import './FindLawyersPage.css';

const FindLawyersPage = () => {
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
            const params = {
                query: searchQuery,
                ...filters,
                limit: 12
            };
            const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v)); // Remove empty params

            const response = await axios.get('/api/marketplace/profiles/search', { params: cleanParams });
            setLawyers(response.data.data.profiles || response.data.data); // Handle potential response variations
        } catch (error) {
            console.error('Error fetching lawyers:', error);
            // setLawyers([]); // Keep previous results or empty
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLawyers();
    }, [filters]); // Auto-fetch on filter change

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLawyers();
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
                                        <button className="btn btn-outline btn-sm">View Profile</button>
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
