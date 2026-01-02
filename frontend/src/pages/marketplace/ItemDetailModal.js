import React from 'react';
import { FaTimes, FaMapMarkerAlt, FaUser, FaPhone } from 'react-icons/fa';
import './ListingCard.css'; // Reuse styles

const ItemDetailModal = ({ isOpen, onClose, item, onContact }) => {
    if (!isOpen || !item) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                <button className="close-modal" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="item-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="detail-image">
                        {item.mainImage ? (
                            <img src={item.mainImage} alt={item.title} style={{ width: '100%', borderRadius: '8px' }} />
                        ) : (
                            <div className="placeholder-image large" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#334155', borderRadius: '8px' }}>
                                <span style={{ fontSize: '3rem' }}>🛍️</span>
                            </div>
                        )}
                    </div>

                    <div className="detail-info">
                        <h2>{item.title}</h2>
                        <div className="detail-price" style={{ fontSize: '1.5rem', color: '#f59e0b', margin: '1rem 0', fontWeight: 'bold' }}>
                            {item.isFree ? 'Free' : `Rs. ${item.price.toLocaleString()}`}
                        </div>

                        <div className="detail-meta" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <FaMapMarkerAlt /> {item.location?.city}, {item.location?.province}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaUser /> Posted by: {item.seller?.firstName} {item.seller?.lastName}
                            </div>
                        </div>

                        <div className="detail-description" style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
                            <p>{item.description}</p>
                        </div>

                        <button className="btn btn-primary full-width" onClick={() => onContact(item.seller)}>
                            <FaPhone /> Contact Seller
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailModal;
