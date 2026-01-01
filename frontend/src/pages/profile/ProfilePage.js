import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { FaUser, FaBriefcase, FaMapMarkerAlt, FaUniversity, FaSave } from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        professionalTitle: '',
        bio: '',
        primarySpecialization: '',
        yearsOfExperience: '',
        city: '',
        barCouncil: 'Punjab Bar Council',
        enrollmentNumber: '',
        consultationFee: ''
    });

    useEffect(() => {
        if (user?.role === 'lawyer') {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/marketplace/profiles/me');
            const data = response.data.data.profile;
            setProfile(data);
            setFormData({
                professionalTitle: data.professionalTitle || '',
                bio: data.bio || '',
                primarySpecialization: data.primarySpecialization || '',
                yearsOfExperience: data.yearsOfExperience || '',
                city: data.officeAddress?.city || '',
                barCouncil: data.barCouncil || 'Punjab Bar Council',
                enrollmentNumber: data.enrollmentNumber || '',
                consultationFee: data.consultation?.fee || ''
            });
        } catch (error) {
            // Profile not found - keep default/empty state for creation
            console.log('Profile not found, ready to create');
            setIsEditing(true); // Auto-open edit mode if no profile
            // Pre-fill from user object if available
            setFormData(prev => ({
                ...prev,
                enrollmentNumber: user.barLicenseNumber || '',
                barCouncil: user.barAssociation || 'Punjab Bar Council',
                yearsOfExperience: user.yearsOfExperience || ''
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                officeAddress: { city: formData.city },
                consultation: { fee: formData.consultationFee }
            };

            await axios.post('/api/marketplace/profiles', payload);
            alert('Profile saved successfully!');
            setIsEditing(false);
            fetchProfile(); // Refresh
        } catch (error) {
            alert('Error saving profile: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-5 text-center">Please log in</div>;

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header-actions">
                    <h1 className="page-title">My Profile</h1>
                    {user.role === 'lawyer' && !isEditing && (
                        <button onClick={() => setIsEditing(true)} className="btn btn-primary glow-effect">
                            <FaUser /> Edit Profile
                        </button>
                    )}
                </div>

                <div className="profile-card glass-panel">
                    {/* Cover Section */}
                    <div className="profile-cover-gradient"></div>

                    {/* Basic User Info */}
                    <div className="user-info-section">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar-large">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                        </div>
                        <div className="user-details">
                            <h2>{user.firstName} {user.lastName}</h2>
                            <p className="text-muted email-text">{user.email}</p>
                            <span className="role-chip">{user.role}</span>
                        </div>
                    </div>

                    {user.role === 'lawyer' && (
                        <div className="lawyer-profile-section">
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="profile-form animated-form">
                                    <div className="form-section-title">Professional Information</div>

                                    <div className="form-group">
                                        <label>Professional Title</label>
                                        <input
                                            name="professionalTitle"
                                            value={formData.professionalTitle}
                                            onChange={handleChange}
                                            placeholder="e.g. Senior Advocate High Court"
                                            required
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Specialization</label>
                                            <div className="input-with-icon">
                                                <FaBriefcase className="input-icon" />
                                                <input
                                                    name="primarySpecialization"
                                                    value={formData.primarySpecialization}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Criminal Law"
                                                    required
                                                    className="form-control"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group half">
                                            <label>City</label>
                                            <div className="input-with-icon">
                                                <FaMapMarkerAlt className="input-icon" />
                                                <input
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Lahore"
                                                    required
                                                    className="form-control"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-section-title">Details & Experience</div>

                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Bar Council</label>
                                            <div className="select-wrapper">
                                                <select
                                                    name="barCouncil"
                                                    value={formData.barCouncil}
                                                    onChange={handleChange}
                                                    className="form-control"
                                                >
                                                    <option value="Punjab Bar Council">Punjab Bar Council</option>
                                                    <option value="Sindh Bar Council">Sindh Bar Council</option>
                                                    <option value="KPK Bar Council">KPK Bar Council</option>
                                                    <option value="Balochistan Bar Council">Balochistan Bar Council</option>
                                                    <option value="Islamabad Bar Council">Islamabad Bar Council</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group half">
                                            <label>Enrollment / License #</label>
                                            <div className="input-with-icon">
                                                <FaUniversity className="input-icon" />
                                                <input
                                                    name="enrollmentNumber"
                                                    value={formData.enrollmentNumber}
                                                    onChange={handleChange}
                                                    required
                                                    className="form-control"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Years of Experience</label>
                                            <input
                                                type="number"
                                                name="yearsOfExperience"
                                                value={formData.yearsOfExperience}
                                                onChange={handleChange}
                                                required
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="form-group half">
                                            <label>Consultation Fee (PKR)</label>
                                            <input
                                                type="number"
                                                name="consultationFee"
                                                value={formData.consultationFee}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Tell potential clients about your experience..."
                                            rows="4"
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" disabled={!profile}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            <FaSave /> {loading ? 'Saving...' : 'Save Profile'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="profile-view animated-fade-in">
                                    {profile ? (
                                        <>
                                            <div className="profile-stats-grid">
                                                <div className="stat-box">
                                                    <span className="stat-label">Title</span>
                                                    <span className="stat-value">{profile.professionalTitle}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <span className="stat-label">Specialization</span>
                                                    <span className="stat-value highlight">{profile.primarySpecialization}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <span className="stat-label">Location</span>
                                                    <span className="stat-value"><FaMapMarkerAlt /> {profile.officeAddress?.city || 'N/A'}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <span className="stat-label">Experience</span>
                                                    <span className="stat-value">{profile.yearsOfExperience} Years</span>
                                                </div>
                                            </div>

                                            <div className="profile-bio-section">
                                                <h3>About Me</h3>
                                                <p className="bio-text">{profile.bio || <span className="text-muted italic">No biography provided yet. Edit your profile to add one.</span>}</p>
                                            </div>

                                            <div className="profile-meta-grid">
                                                <div className="meta-item">
                                                    <div className="meta-icon"><FaUniversity /></div>
                                                    <div>
                                                        <div className="meta-label">Bar Council</div>
                                                        <div className="meta-value">{profile.barCouncil}</div>
                                                    </div>
                                                </div>
                                                <div className="meta-item">
                                                    <div className="meta-icon"><FaBriefcase /></div>
                                                    <div>
                                                        <div className="meta-label">License Number</div>
                                                        <div className="meta-value">{profile.enrollmentNumber}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="empty-profile-state">
                                            <div className="empty-icon">📝</div>
                                            <h3>Complete Your Profile</h3>
                                            <p>Create your professional lawyer profile to get discovered by clients.</p>
                                            <button onClick={() => setIsEditing(true)} className="btn btn-primary glow-effect">Create Profile</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
