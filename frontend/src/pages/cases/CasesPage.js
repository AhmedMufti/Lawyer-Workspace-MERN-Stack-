import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchCases, createCase } from '../../store/slices/caseSlice';
import './CasesPage.css';

const CasesPage = () => {
    const dispatch = useDispatch();
    const { cases, loading, error } = useSelector((state) => state.cases);
    const { user: activeUser } = useSelector((state) => state.auth);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const initialFormState = {
        caseNumber: '',
        caseTitle: '',
        caseType: 'Civil',
        priority: 'Medium',
        filingDate: new Date().toISOString().split('T')[0],
        court: {
            name: '',
            city: '',
            courtType: 'District Court',
            courtNumber: '',
            judge: ''
        },
        petitioner: {
            name: '',
            contactNumber: '',
            email: ''
        },
        respondent: {
            name: '',
            contactNumber: '',
            email: ''
        },
        description: '',
        // New: Team access fields
        litigantEmail: '',
        clerkEmail: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [validationError, setValidationError] = useState(null);

    // Team member search states
    const [litigantSearch, setLitigantSearch] = useState('');
    const [clerkSearch, setClerkSearch] = useState('');
    const [foundLitigant, setFoundLitigant] = useState(null);
    const [foundClerk, setFoundClerk] = useState(null);
    const [searchingLitigant, setSearchingLitigant] = useState(false);
    const [searchingClerk, setSearchingClerk] = useState(false);
    const [litigantError, setLitigantError] = useState('');
    const [clerkError, setClerkError] = useState('');

    useEffect(() => {
        dispatch(fetchCases({ page: 1, limit: 20 }));
    }, [dispatch]);

    // Search for user by email
    const searchUserByEmail = async (email, type) => {
        if (!email || !email.includes('@')) {
            if (type === 'litigant') setLitigantError('Please enter a valid email');
            else setClerkError('Please enter a valid email');
            return;
        }

        if (type === 'litigant') {
            setSearchingLitigant(true);
            setLitigantError('');
        } else {
            setSearchingClerk(true);
            setClerkError('');
        }

        try {
            const response = await axios.get(`/api/users/search?email=${encodeURIComponent(email)}`);
            const user = response.data.data?.user;

            if (user) {
                if (type === 'litigant') {
                    setFoundLitigant(user);
                    setFormData(prev => ({ ...prev, litigantEmail: email }));
                } else {
                    setFoundClerk(user);
                    setFormData(prev => ({ ...prev, clerkEmail: email }));
                }
            } else {
                if (type === 'litigant') setLitigantError('User not found with this email');
                else setClerkError('User not found with this email');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'User not found';
            if (type === 'litigant') setLitigantError(msg);
            else setClerkError(msg);
        } finally {
            if (type === 'litigant') setSearchingLitigant(false);
            else setSearchingClerk(false);
        }
    };

    const removeLitigant = () => {
        setFoundLitigant(null);
        setLitigantSearch('');
        setFormData(prev => ({ ...prev, litigantEmail: '' }));
    };

    const removeClerk = () => {
        setFoundClerk(null);
        setClerkSearch('');
        setFormData(prev => ({ ...prev, clerkEmail: '' }));
    };

    const validateForm = () => {
        const errors = [];

        // Basic Info
        if (!formData.caseNumber) errors.push({ tab: 'basic', msg: 'Case Number is required' });
        if (!formData.caseTitle) errors.push({ tab: 'basic', msg: 'Case Title is required' });
        if (!formData.filingDate) errors.push({ tab: 'basic', msg: 'Filing Date is required' });

        // Court Details
        if (!formData.court.name) errors.push({ tab: 'court', msg: 'Court Name is required' });
        if (!formData.court.city) errors.push({ tab: 'court', msg: 'Court City is required' });

        // Parties
        if (!formData.petitioner.name) errors.push({ tab: 'parties', msg: 'Petitioner Name is required' });
        if (!formData.respondent.name) errors.push({ tab: 'parties', msg: 'Respondent Name is required' });

        return errors;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setValidationError(null);

        const errors = validateForm();
        if (errors.length > 0) {
            setValidationError(errors[0].msg);
            setActiveTab(errors[0].tab);
            return;
        }

        // Prepare case data with team members
        const caseData = {
            ...formData,
            // Add litigant to allowedUsers array
            allowedUsers: foundLitigant ? [foundLitigant._id] : [],
            // Add clerk to clerks array
            clerks: foundClerk ? [foundClerk._id] : []
        };

        // Debug logging
        console.log('Found Litigant:', foundLitigant);
        console.log('Found Clerk:', foundClerk);
        console.log('Case Data being sent:', caseData);

        // Remove the email fields since they're not part of the schema
        delete caseData.litigantEmail;
        delete caseData.clerkEmail;

        const result = await dispatch(createCase(caseData));
        if (createCase.fulfilled.match(result)) {
            setShowModal(false);
            setFormData(initialFormState);
            setActiveTab('basic');
            setValidationError(null);
            // Reset team member states
            setFoundLitigant(null);
            setFoundClerk(null);
            setLitigantSearch('');
            setClerkSearch('');
        } else if (createCase.rejected.match(result)) {
            // Display backend error
            const backendError = result.payload;
            let errorMsg = backendError?.message || 'Failed to create case';

            // If there are detailed field errors, show the first one
            if (backendError?.errors && Array.isArray(backendError.errors) && backendError.errors.length > 0) {
                errorMsg = `${backendError.message}: ${backendError.errors[0].message}`;
            }

            setValidationError(errorMsg);
        }
    };

    const updateField = (section, field, value) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        if (validationError) setValidationError(null); // Clear error on change
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'court', label: 'Court Details' },
        { id: 'parties', label: 'Parties' },
        { id: 'team', label: 'Team Access' },
        { id: 'description', label: 'Description' }
    ];

    return (
        <div className="cases-page">
            <div className="container">
                <header className="page-header">
                    <div className="header-text">
                        <h1 className="page-title">Case Management</h1>
                        <p className="page-subtitle">Organize, track, and manage your legal proceedings efficiently.</p>
                    </div>
                    {/* Only show 'New Case' button for lawyers */}
                    {activeUser?.role === 'lawyer' && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary">
                            <span className="icon-plus">+</span> New Case
                        </button>
                    )}
                </header>

                {error && <div className="alert alert-error">{typeof error === 'string' ? error : error.message || 'An error occurred'}</div>}

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-large"></div>
                        <p>Loading your cases...</p>
                    </div>
                ) : (
                    <div className="cases-grid">
                        {cases && cases.length > 0 ? (
                            cases.map((caseItem) => (
                                <Link key={caseItem._id} to={`/dashboard/cases/${caseItem._id}`} className="case-card card-glass">
                                    <div className="case-status-strip" data-status={caseItem.caseStatus}></div>
                                    <div className="case-card-content">
                                        <div className="case-header-row">
                                            <span className="case-number-badge">{caseItem.caseNumber}</span>
                                            <span className={`status-badge status-${caseItem.caseStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                {caseItem.caseStatus}
                                            </span>
                                        </div>

                                        <h3 className="case-title">{caseItem.caseTitle}</h3>

                                        <div className="case-meta-row">
                                            <div className="meta-item">
                                                <span className="meta-label">Court</span>
                                                <span className="meta-value">{caseItem.court?.name || 'N/A'}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">Type</span>
                                                <span className="meta-value">{caseItem.caseType}</span>
                                            </div>
                                        </div>

                                        <div className="case-parties">
                                            <p><strong>Petitioner:</strong> {caseItem.petitioner?.name}</p>
                                            <p><strong>Respondent:</strong> {caseItem.respondent?.name}</p>
                                        </div>

                                        <p className="case-date">Filed on {new Date(caseItem.filingDate).toLocaleDateString()}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📂</div>
                                <h3>No cases found</h3>
                                {activeUser?.role === 'lawyer' ? (
                                    <>
                                        <p>Get started by creating your first legal case.</p>
                                        <button onClick={() => setShowModal(true)} className="btn btn-primary mt-4">Create First Case</button>
                                    </>
                                ) : (
                                    <p>You haven't been added to any cases yet. A lawyer will add you when you're involved in a case.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content card-glass">
                            <div className="modal-header">
                                <h2>Create New Case</h2>
                                <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
                            </div>

                            {validationError && (
                                <div className="alert alert-error" style={{ margin: '0 1.5rem 1rem' }}>
                                    ⚠️ {validationError}
                                </div>
                            )}

                            <div className="modal-tabs">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleCreate} className="modal-form">
                                <div className="form-scroll-area">
                                    {/* Basic Info Tab */}
                                    {activeTab === 'basic' && (
                                        <div className="form-section">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Case Number *</label>
                                                    <input
                                                        required
                                                        value={formData.caseNumber}
                                                        onChange={(e) => updateField(null, 'caseNumber', e.target.value)}
                                                        placeholder="e.g. CS-2023-1001"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Case Type *</label>
                                                    <select
                                                        value={formData.caseType}
                                                        onChange={(e) => updateField(null, 'caseType', e.target.value)}
                                                    >
                                                        <option>Civil</option>
                                                        <option>Criminal</option>
                                                        <option>Family</option>
                                                        <option>Corporate</option>
                                                        <option>Constitutional</option>
                                                        <option>Labor</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Case Title *</label>
                                                <input
                                                    required
                                                    value={formData.caseTitle}
                                                    onChange={(e) => updateField(null, 'caseTitle', e.target.value)}
                                                    placeholder="e.g. State vs. John Doe"
                                                />
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Filing Date *</label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={formData.filingDate}
                                                        onChange={(e) => updateField(null, 'filingDate', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Priority</label>
                                                    <select
                                                        value={formData.priority}
                                                        onChange={(e) => updateField(null, 'priority', e.target.value)}
                                                    >
                                                        <option>Low</option>
                                                        <option>Medium</option>
                                                        <option>High</option>
                                                        <option>Urgent</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Court Details Tab */}
                                    {activeTab === 'court' && (
                                        <div className="form-section">
                                            <div className="form-group">
                                                <label>Court Name *</label>
                                                <input
                                                    required
                                                    value={formData.court.name}
                                                    onChange={(e) => updateField('court', 'name', e.target.value)}
                                                    placeholder="e.g. High Court of Sindh"
                                                />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>City *</label>
                                                    <input
                                                        required
                                                        value={formData.court.city}
                                                        onChange={(e) => updateField('court', 'city', e.target.value)}
                                                        placeholder="e.g. Karachi"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Court Type *</label>
                                                    <select
                                                        value={formData.court.courtType}
                                                        onChange={(e) => updateField('court', 'courtType', e.target.value)}
                                                    >
                                                        <option>Supreme Court</option>
                                                        <option>High Court</option>
                                                        <option>District Court</option>
                                                        <option>Sessions Court</option>
                                                        <option>Magistrate Court</option>
                                                        <option>Tribunal</option>
                                                        <option>Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Court Number</label>
                                                    <input
                                                        value={formData.court.courtNumber}
                                                        onChange={(e) => updateField('court', 'courtNumber', e.target.value)}
                                                        placeholder="Room No. / Court No."
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Judge Name</label>
                                                    <input
                                                        value={formData.court.judge}
                                                        onChange={(e) => updateField('court', 'judge', e.target.value)}
                                                        placeholder="Honorable Justice..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Parties Tab */}
                                    {activeTab === 'parties' && (
                                        <div className="form-section">
                                            <h4>Petitioner Info</h4>
                                            <div className="form-group">
                                                <label>Name *</label>
                                                <input
                                                    required
                                                    value={formData.petitioner.name}
                                                    onChange={(e) => updateField('petitioner', 'name', e.target.value)}
                                                    placeholder="Full Name"
                                                />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Contact</label>
                                                    <input
                                                        value={formData.petitioner.contactNumber}
                                                        onChange={(e) => updateField('petitioner', 'contactNumber', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Email</label>
                                                    <input
                                                        type="email"
                                                        value={formData.petitioner.email}
                                                        onChange={(e) => updateField('petitioner', 'email', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <hr className="form-divider" />

                                            <h4>Respondent Info</h4>
                                            <div className="form-group">
                                                <label>Name *</label>
                                                <input
                                                    required
                                                    value={formData.respondent.name}
                                                    onChange={(e) => updateField('respondent', 'name', e.target.value)}
                                                    placeholder="Full Name"
                                                />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Contact</label>
                                                    <input
                                                        value={formData.respondent.contactNumber}
                                                        onChange={(e) => updateField('respondent', 'contactNumber', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Email</label>
                                                    <input
                                                        type="email"
                                                        value={formData.respondent.email}
                                                        onChange={(e) => updateField('respondent', 'email', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Team Access Tab */}
                                    {activeTab === 'team' && (
                                        <div className="form-section">
                                            <p className="team-info-text" style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                                Add team members who should have access to view this case. Search by their registered email address.
                                            </p>

                                            {/* Litigant/Client Section */}
                                            <div className="team-member-section" style={{ marginBottom: '2rem' }}>
                                                <h4 style={{ color: '#f59e0b', marginBottom: '1rem' }}>👤 Litigant / Client</h4>

                                                {foundLitigant ? (
                                                    <div className="found-user-card" style={{
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                                        borderRadius: '10px',
                                                        padding: '1rem',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <strong style={{ color: '#10b981' }}>✓ {foundLitigant.firstName} {foundLitigant.lastName}</strong>
                                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{foundLitigant.email}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={removeLitigant}
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="form-row">
                                                        <div className="form-group" style={{ flex: 1 }}>
                                                            <input
                                                                type="email"
                                                                value={litigantSearch}
                                                                onChange={(e) => setLitigantSearch(e.target.value)}
                                                                placeholder="Enter litigant's email address"
                                                            />
                                                            {litigantError && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{litigantError}</span>}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => searchUserByEmail(litigantSearch, 'litigant')}
                                                            disabled={searchingLitigant}
                                                            className="btn btn-outline"
                                                            style={{ height: '44px' }}
                                                        >
                                                            {searchingLitigant ? 'Searching...' : 'Search'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Clerk Section */}
                                            <div className="team-member-section">
                                                <h4 style={{ color: '#f59e0b', marginBottom: '1rem' }}>📋 Clerk</h4>

                                                {foundClerk ? (
                                                    <div className="found-user-card" style={{
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                                        borderRadius: '10px',
                                                        padding: '1rem',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <strong style={{ color: '#10b981' }}>✓ {foundClerk.firstName} {foundClerk.lastName}</strong>
                                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{foundClerk.email}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={removeClerk}
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="form-row">
                                                        <div className="form-group" style={{ flex: 1 }}>
                                                            <input
                                                                type="email"
                                                                value={clerkSearch}
                                                                onChange={(e) => setClerkSearch(e.target.value)}
                                                                placeholder="Enter clerk's email address"
                                                            />
                                                            {clerkError && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{clerkError}</span>}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => searchUserByEmail(clerkSearch, 'clerk')}
                                                            disabled={searchingClerk}
                                                            className="btn btn-outline"
                                                            style={{ height: '44px' }}
                                                        >
                                                            {searchingClerk ? 'Searching...' : 'Search'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'description' && (
                                        <div className="form-section">
                                            <div className="form-group">
                                                <label>Case Description</label>
                                                <textarea
                                                    rows="6"
                                                    value={formData.description}
                                                    onChange={(e) => updateField(null, 'description', e.target.value)}
                                                    placeholder="Provide detailed description of the case..."
                                                ></textarea>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                                    <button type="submit" className="btn btn-primary">Create Case</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CasesPage;
