import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaBriefcase, FaCog, FaShieldAlt, FaSave, FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import { updateProfile, clearSuccess, clearError } from '../../store/slices/authSlice';
import './ProfilePage.css';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { user, loading, success, error } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('account');
    const [editMode, setEditMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        bio: '',
        street: '',
        city: '',
        state: '',
        country: 'Pakistan',
        preferredLanguage: 'en',
        emailNotifications: true,
        smsNotifications: true
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                bio: user.bio || '',
                street: user.officeAddress?.street || '',
                city: user.officeAddress?.city || '',
                state: user.officeAddress?.state || '',
                country: user.officeAddress?.country || 'Pakistan',
                preferredLanguage: user.preferredLanguage || 'en',
                emailNotifications: user.emailNotifications !== false,
                smsNotifications: user.smsNotifications !== false
            });
        }
    }, [user]);

    // Cleanup warnings/success on unmount or tab change
    useEffect(() => {
        return () => {
            dispatch(clearSuccess());
            dispatch(clearError());
        };
    }, [dispatch, activeTab]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Structure payload correctly
        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            bio: formData.bio,
            officeAddress: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                country: formData.country
            },
            preferredLanguage: formData.preferredLanguage,
            emailNotifications: formData.emailNotifications,
            smsNotifications: formData.smsNotifications
        };

        dispatch(updateProfile(payload));
        setEditMode(false);
    };

    if (!user) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="profile-page-container">
            {/* Header Section */}
            <div className="profile-header-card glass-panel">
                <div className="profile-cover"></div>
                <div className="profile-header-content">
                    <div className="profile-avatar-section">
                        <div className="avatar-circle">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <button className="change-avatar-btn">
                            <FaCamera />
                        </button>
                    </div>
                    <div className="profile-info-primary">
                        <h1>{user.firstName} {user.lastName}</h1>
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                        <p className="user-email"><FaEnvelope /> {user.email}</p>
                    </div>
                    <div className="profile-header-actions">
                        {!editMode && (
                            <button onClick={() => { setEditMode(true); setActiveTab('account'); }} className="btn btn-primary">
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="profile-grid">
                {/* Sidebar Navigation */}
                <div className="profile-sidebar glass-panel">
                    <nav className="profile-nav">
                        <button
                            className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <FaUser /> Account Details
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preferences')}
                        >
                            <FaCog /> Preferences
                        </button>
                        {user.role === 'lawyer' && (
                            <button
                                className={`nav-item ${activeTab === 'professional' ? 'active' : ''}`}
                                onClick={() => setActiveTab('professional')}
                            >
                                <FaBriefcase /> Professional Info
                            </button>
                        )}
                        <button
                            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <FaShieldAlt /> Security
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="profile-content glass-panel">
                    {success && <div className="alert alert-success">Profile updated successfully!</div>}
                    {error && <div className="alert alert-error">{error.message || 'An error occurred'}</div>}

                    {activeTab === 'account' && (
                        <div className="tab-content fade-in">
                            <div className="section-header">
                                <h2>Account Details</h2>
                                <p>Manage your personal information and contact details.</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <div className="input-icon-wrapper">
                                            <FaPhone className="field-icon" />
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email (Read Only)</label>
                                        <div className="input-icon-wrapper">
                                            <FaEnvelope className="field-icon" />
                                            <input value={user.email} disabled className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            rows="4"
                                            className="form-control"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>

                                <div className="section-divider"></div>
                                <h3>Location</h3>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Street Address</label>
                                        <input
                                            name="street"
                                            value={formData.street}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State / Province</label>
                                        <input
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                {editMode && (
                                    <div className="form-actions">
                                        <button type="button" onClick={() => setEditMode(false)} className="btn btn-secondary">Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="tab-content fade-in">
                            <div className="section-header">
                                <h2>Preferences</h2>
                                <p>Customize your experience.</p>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Preferred Language</label>
                                    <div className="input-icon-wrapper">
                                        <FaGlobe className="field-icon" />
                                        <select
                                            name="preferredLanguage"
                                            value={formData.preferredLanguage}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className="form-control"
                                        >
                                            <option value="en">English (English)</option>
                                            <option value="ur">Urdu (اردو)</option>
                                            <option value="sd">Sindhi (سنڌي)</option>
                                            <option value="ps">Pashto (پښتو)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="settings-group">
                                    <h3>Notifications</h3>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            name="emailNotifications"
                                            checked={formData.emailNotifications}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                        />
                                        <span className="slider"></span>
                                        <span className="toggle-label">Email Notifications</span>
                                    </label>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            name="smsNotifications"
                                            checked={formData.smsNotifications}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                        />
                                        <span className="slider"></span>
                                        <span className="toggle-label">SMS Notifications</span>
                                    </label>
                                </div>

                                {editMode && (
                                    <div className="form-actions">
                                        <button type="button" onClick={() => setEditMode(false)} className="btn btn-secondary">Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>Save Preferences</button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {activeTab === 'professional' && user.role === 'lawyer' && (
                        <div className="tab-content fade-in">
                            <div className="section-header">
                                <h2>Professional Information</h2>
                                <p>These details appear on your public profile and marketplace listing.</p>
                            </div>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Bar License Number</label>
                                    <div className="value">{user.barLicenseNumber || 'Not Set'}</div>
                                    <small className="help-text">Contact support to update this verified field.</small>
                                </div>
                                <div className="info-item">
                                    <label>Bar Association</label>
                                    <div className="value">{user.barAssociation || 'Not Set'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Experience</label>
                                    <div className="value">{user.yearsOfExperience ? `${user.yearsOfExperience} Years` : 'Not Set'}</div>
                                </div>
                                <div className="info-item full-width">
                                    <label>Primary Specialization</label>
                                    <div className="tags">
                                        {user.specializations && user.specializations.length > 0
                                            ? user.specializations.map((spec, i) => <span key={i} className="tag">{spec}</span>)
                                            : <span className="text-muted">No specializations listed</span>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="alert alert-info mt-4">
                                To update professional details or manage your detailed public showcase (courts, fees, education),
                                please visit the <strong>Marketplace Dashboard</strong>.
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="tab-content fade-in">
                            <div className="section-header">
                                <h2>Security Settings</h2>
                                <p>Manage your account security.</p>
                            </div>
                            <div className="security-item">
                                <div className="security-info">
                                    <h3>Password</h3>
                                    <p>Last changed: {user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Never'}</p>
                                </div>
                                <button className="btn btn-outline" onClick={() => alert('Password change feature coming in next update')}>Change Password</button>
                            </div>
                            <div className="security-item">
                                <div className="security-info">
                                    <h3>Two-Factor Authentication</h3>
                                    <p>Add an extra layer of security to your account.</p>
                                </div>
                                <button className="btn btn-outline" disabled>Coming Soon</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
