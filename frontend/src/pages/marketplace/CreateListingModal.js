import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import './CreateListingModal.css';

const CreateListingModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Books & Publications',
        price: '',
        location: {
            city: '',
            address: ''
        },
        condition: 'Good',
        contactPreference: {
            preferredMethod: 'Phone'
        }
    });

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get token from local storage (assuming standard storage)
            const token = localStorage.getItem('token');

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.post('/api/marketplace/items', formData, config);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating listing:', error);
            alert('Failed to create listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content create-listing-modal">
                <div className="modal-header">
                    <h2>Create New Listing</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="What are you selling?"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option>Books & Publications</option>
                                <option>Legal Software</option>
                                <option>Office Equipment</option>
                                <option>Furniture</option>
                                <option>Gowns & Attire</option>
                                <option>Legal Services</option>
                                <option>Free Stuff</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Price (PKR)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Condition</label>
                        <select name="condition" value={formData.condition} onChange={handleChange}>
                            <option>New</option>
                            <option>Like New</option>
                            <option>Good</option>
                            <option>Fair</option>
                            <option>For Parts</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            name="location.city"
                            value={formData.location.city}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Lahore"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            placeholder="Describe your item..."
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Posting...' : 'Post Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListingModal;
