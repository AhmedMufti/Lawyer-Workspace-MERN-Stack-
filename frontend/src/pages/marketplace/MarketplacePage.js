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
                <div className="marketplace-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Marketplace</h1>
                    <p className="page-subtitle" style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '1.5rem' }}>Buy, sell, and find legal resources</p>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ margin: '0 auto' }}>
                        <FaPlus /> Post Listing
                    </button>
                </div>

                <div className="search-section" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <form onSubmit={handleSearch} className="search-bar" style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '800px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FaSearch className="search-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search items, books, services..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', paddingLeft: '3rem', paddingRight: '1rem', height: '50px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem', height: '50px' }}>Search</button>
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
                                gap: '1.5rem',
                                marginTop: '2rem',
                                width: '100%'
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
