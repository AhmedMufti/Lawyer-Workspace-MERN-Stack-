import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListingCard from './ListingCard';
import CreateListingModal from './CreateListingModal';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import './ListingCard.css';

const MarketplacePage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async (query = '') => {
        setLoading(true);
        try {
            const endpoint = query
                ? '/api/marketplace/items/search'
                : '/api/marketplace/items';

            const params = {
                page: 1,
                limit: 12,
                query: query
            };

            const response = await axios.get(endpoint, { params });
            // API returns paginated data in data.data or directly as array depending on endpoint wrapper
            // Based on controller: sendPaginated puts items in 'data'
            setItems(response.data.data.items || response.data.data);

            if (response.data.pagination) {
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching marketplace items:', error);
            // Fallback for empty state or error
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems(searchQuery);
    };

    const handleCreateSuccess = () => {
        fetchItems(); // Refresh list after creation
    };

    return (
        <div className="marketplace-page">
            <div className="container">
                <div className="marketplace-header">
                    <div>
                        <h1 className="page-title">Marketplace</h1>
                        <p className="page-subtitle">Buy, sell, and find legal resources</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <FaPlus /> Post Listing
                    </button>
                </div>

                <div className="search-section">
                    <form onSubmit={handleSearch} className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search items, books, services..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading marketplace...</p>
                    </div>
                ) : (
                    <>
                        {items.length > 0 ? (
                            <div className="listing-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '2rem',
                                marginTop: '2rem'
                            }}>
                                {items.map(item => (
                                    <ListingCard key={item._id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🛍️</div>
                                <p>No items found. Be the first to post!</p>
                            </div>
                        )}
                    </>
                )}

                <CreateListingModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            </div>
        </div>
    );
};

export default MarketplacePage;
