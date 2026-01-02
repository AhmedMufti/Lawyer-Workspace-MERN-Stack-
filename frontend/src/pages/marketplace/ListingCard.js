import React from 'react';
import { FaTag, FaMapMarkerAlt, FaUser, FaPhone } from 'react-icons/fa';

const ListingCard = ({ item, onContact, onViewDetails }) => {
    return (
        <div className="listing-card">
            <div className="listing-image">
                {item.mainImage ? (
                    <img src={item.mainImage} alt={item.title} />
                ) : (
                    <div className="placeholder-image">
                        <FaTag />
                    </div>
                )}
                {item.isFree && <span className="listing-badge free">Free</span>}
                <span className="listing-category">{item.category}</span>
            </div>

            <div className="listing-content">
                <div className="listing-header">
                    <h3 className="listing-title">{item.title}</h3>
                    <div className="listing-price">
                        {item.isFree ? 'Free' : `Rs. ${item.price.toLocaleString()}`}
                    </div>
                </div>

                <div className="listing-meta">
                    <div className="meta-item">
                        <FaMapMarkerAlt />
                        <span>{item.location?.city || 'Unknown Location'}</span>
                    </div>
                    <div className="meta-item">
                        <FaUser />
                        <span>{item.seller?.firstName} {item.seller?.lastName}</span>
                    </div>
                </div>

                <p className="listing-description">
                    {item.description?.substring(0, 100)}
                    {item.description?.length > 100 && '...'}
                </p>

                <div className="listing-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => onViewDetails(item)}>Details</button>
                    <button className="btn btn-sm btn-primary" onClick={() => onContact(item.seller)}>
                        <FaPhone /> Contact
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
