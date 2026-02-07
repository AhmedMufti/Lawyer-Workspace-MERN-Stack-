import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/axios';
import { fetchCaseById, updateCase } from '../../store/slices/caseSlice';
import DocumentsList from './DocumentsList';
import DocumentUploadModal from './DocumentUploadModal';
import './CaseDetailPage.css';

const CaseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentCase, loading, error } = useSelector((state) => state.cases);
    const { user } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('overview');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Team management states
    const [teamSearch, setTeamSearch] = useState('');
    const [searchType, setSearchType] = useState('litigant');
    const [searchResult, setSearchResult] = useState(null);
    const [searching, setSearching] = useState(false);
    const [teamError, setTeamError] = useState('');

    useEffect(() => {
        dispatch(fetchCaseById(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (currentCase) {
            setEditData({
                caseTitle: currentCase.caseTitle || '',
                caseType: currentCase.caseType || 'Civil',
                caseStatus: currentCase.caseStatus || 'Filed',
                priority: currentCase.priority || 'Medium',
                description: currentCase.description || '',
                court: {
                    name: currentCase.court?.name || '',
                    city: currentCase.court?.city || '',
                    courtType: currentCase.court?.courtType || 'District Court',
                    courtNumber: currentCase.court?.courtNumber || '',
                    judge: currentCase.court?.judge || ''
                },
                petitioner: {
                    name: currentCase.petitioner?.name || '',
                    contactNumber: currentCase.petitioner?.contactNumber || '',
                    email: currentCase.petitioner?.email || ''
                },
                respondent: {
                    name: currentCase.respondent?.name || '',
                    contactNumber: currentCase.respondent?.contactNumber || '',
                    email: currentCase.respondent?.email || ''
                }
            });
        }
    }, [currentCase]);

    const isLawyer = user?.role === 'lawyer';
    const isLeadLawyer = currentCase?.leadLawyer?._id === user?._id || currentCase?.leadLawyer === user?._id;

    const handleEdit = () => {
        setIsEditing(true);
        setSaveError(null);
        setSaveSuccess(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSaveError(null);
        // Reset edit data
        if (currentCase) {
            setEditData({
                caseTitle: currentCase.caseTitle || '',
                caseType: currentCase.caseType || 'Civil',
                caseStatus: currentCase.caseStatus || 'Filed',
                priority: currentCase.priority || 'Medium',
                description: currentCase.description || '',
                court: currentCase.court || {},
                petitioner: currentCase.petitioner || {},
                respondent: currentCase.respondent || {}
            });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            await dispatch(updateCase({ id: currentCase._id, data: editData })).unwrap();
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setSaveError(err?.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const updateEditField = (section, field, value) => {
        if (section) {
            setEditData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setEditData(prev => ({ ...prev, [field]: value }));
        }
    };

    // Search for user to add to team
    const searchUser = async () => {
        if (!teamSearch || !teamSearch.includes('@')) {
            setTeamError('Please enter a valid email');
            return;
        }
        setSearching(true);
        setTeamError('');
        setSearchResult(null);

        try {
            const response = await api.get(`/api/users/search?email=${encodeURIComponent(teamSearch)}`);
            const foundUser = response.data.data?.user;
            if (foundUser) {
                setSearchResult(foundUser);
            } else {
                setTeamError('User not found');
            }
        } catch (err) {
            setTeamError(err.response?.data?.message || 'User not found');
        } finally {
            setSearching(false);
        }
    };

    // Add user to case team
    const addToTeam = async () => {
        if (!searchResult) return;

        try {
            const updateData = {};
            if (searchType === 'litigant') {
                const currentAllowed = currentCase.allowedUsers?.map(u => u._id || u) || [];
                updateData.allowedUsers = [...currentAllowed, searchResult._id];
            } else if (searchType === 'clerk') {
                const currentClerks = currentCase.clerks?.map(c => c._id || c) || [];
                updateData.clerks = [...currentClerks, searchResult._id];
            }

            await dispatch(updateCase({ id: currentCase._id, data: updateData })).unwrap();
            dispatch(fetchCaseById(id)); // Refresh
            setSearchResult(null);
            setTeamSearch('');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setTeamError(err?.message || 'Failed to add user to case');
        }
    };

    // Remove user from team
    const removeFromTeam = async (userId, type) => {
        if (!window.confirm('Are you sure you want to remove this person from the case?')) return;

        try {
            const updateData = {};
            if (type === 'litigant') {
                updateData.allowedUsers = (currentCase.allowedUsers || [])
                    .filter(u => (u._id || u) !== userId)
                    .map(u => u._id || u);
            } else if (type === 'clerk') {
                updateData.clerks = (currentCase.clerks || [])
                    .filter(c => (c._id || c) !== userId)
                    .map(c => c._id || c);
            }

            await dispatch(updateCase({ id: currentCase._id, data: updateData })).unwrap();
            dispatch(fetchCaseById(id)); // Refresh
        } catch (err) {
            alert('Failed to remove user: ' + (err?.message || 'Unknown error'));
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner-large"></div></div>;

    if (error) {
        return (
            <div className="container" style={{ paddingTop: '2rem' }}>
                <div className="alert alert-error">
                    <h3>Error Loading Case</h3>
                    <p>{error?.message || 'Could not load case details.'}</p>
                    <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!currentCase) return <div className="container"><h3>Case not found</h3></div>;

    return (
        <div className="case-detail-page">
            <div className="container">
                {/* Header */}
                <div className="detail-header">
                    <div className="header-info">
                        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
                        <h1>{currentCase.caseTitle}</h1>
                        <div className="header-badges">
                            <span className="case-number-badge">{currentCase.caseNumber}</span>
                            <span className={`status-badge status-${currentCase.caseStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                                {currentCase.caseStatus}
                            </span>
                            <span className={`priority-badge priority-${currentCase.priority?.toLowerCase()}`}>
                                {currentCase.priority}
                            </span>
                            <span className="type-badge">{currentCase.caseType}</span>
                        </div>
                    </div>
                    {isLeadLawyer && !isEditing && (
                        <button onClick={handleEdit} className="btn btn-primary">
                            ✏️ Edit Case
                        </button>
                    )}
                </div>

                {/* Success/Error Messages */}
                {saveSuccess && <div className="alert alert-success">✓ Changes saved successfully!</div>}
                {saveError && <div className="alert alert-error">⚠️ {saveError}</div>}

                {/* Tabs */}
                <div className="tabs-nav">
                    <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        📋 Overview
                    </button>
                    <button className={`tab-btn ${activeTab === 'parties' ? 'active' : ''}`} onClick={() => setActiveTab('parties')}>
                        👥 Parties
                    </button>
                    <button className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
                        🏛️ Team
                    </button>
                    <button className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
                        📄 Documents
                    </button>
                </div>

                {/* Tab Content */}
                <div className="detail-content">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="tab-panel">
                            <div className="detail-grid">
                                {/* Case Info Card */}
                                <div className="detail-card">
                                    <h3>📋 Case Information</h3>
                                    {isEditing ? (
                                        <div className="edit-form">
                                            <div className="form-group">
                                                <label>Case Title</label>
                                                <input value={editData.caseTitle} onChange={(e) => updateEditField(null, 'caseTitle', e.target.value)} />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Case Type</label>
                                                    <select value={editData.caseType} onChange={(e) => updateEditField(null, 'caseType', e.target.value)}>
                                                        <option>Civil</option>
                                                        <option>Criminal</option>
                                                        <option>Family</option>
                                                        <option>Corporate</option>
                                                        <option>Constitutional</option>
                                                        <option>Labor</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Status</label>
                                                    <select value={editData.caseStatus} onChange={(e) => updateEditField(null, 'caseStatus', e.target.value)}>
                                                        <option>Filed</option>
                                                        <option>Under Review</option>
                                                        <option>Admitted</option>
                                                        <option>In Progress</option>
                                                        <option>Hearing Scheduled</option>
                                                        <option>Judgment Reserved</option>
                                                        <option>Decided</option>
                                                        <option>Dismissed</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Priority</label>
                                                    <select value={editData.priority} onChange={(e) => updateEditField(null, 'priority', e.target.value)}>
                                                        <option>Low</option>
                                                        <option>Medium</option>
                                                        <option>High</option>
                                                        <option>Urgent</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea rows="4" value={editData.description} onChange={(e) => updateEditField(null, 'description', e.target.value)}></textarea>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="info-list">
                                            <div className="info-item"><span className="label">Case Number:</span><span className="value">{currentCase.caseNumber}</span></div>
                                            <div className="info-item"><span className="label">Type:</span><span className="value">{currentCase.caseType}</span></div>
                                            <div className="info-item"><span className="label">Status:</span><span className="value">{currentCase.caseStatus}</span></div>
                                            <div className="info-item"><span className="label">Priority:</span><span className="value">{currentCase.priority}</span></div>
                                            <div className="info-item"><span className="label">Filing Date:</span><span className="value">{new Date(currentCase.filingDate).toLocaleDateString()}</span></div>
                                            {currentCase.description && (
                                                <div className="info-item full-width">
                                                    <span className="label">Description:</span>
                                                    <p className="value description">{currentCase.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Court Info Card */}
                                <div className="detail-card">
                                    <h3>🏛️ Court Details</h3>
                                    {isEditing ? (
                                        <div className="edit-form">
                                            <div className="form-group">
                                                <label>Court Name</label>
                                                <input value={editData.court?.name || ''} onChange={(e) => updateEditField('court', 'name', e.target.value)} />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>City</label>
                                                    <input value={editData.court?.city || ''} onChange={(e) => updateEditField('court', 'city', e.target.value)} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Court Type</label>
                                                    <select value={editData.court?.courtType || ''} onChange={(e) => updateEditField('court', 'courtType', e.target.value)}>
                                                        <option>Supreme Court</option>
                                                        <option>High Court</option>
                                                        <option>District Court</option>
                                                        <option>Sessions Court</option>
                                                        <option>Magistrate Court</option>
                                                        <option>Tribunal</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Court Number</label>
                                                    <input value={editData.court?.courtNumber || ''} onChange={(e) => updateEditField('court', 'courtNumber', e.target.value)} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Judge</label>
                                                    <input value={editData.court?.judge || ''} onChange={(e) => updateEditField('court', 'judge', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="info-list">
                                            <div className="info-item"><span className="label">Court:</span><span className="value">{currentCase.court?.name || 'N/A'}</span></div>
                                            <div className="info-item"><span className="label">Type:</span><span className="value">{currentCase.court?.courtType || 'N/A'}</span></div>
                                            <div className="info-item"><span className="label">City:</span><span className="value">{currentCase.court?.city || 'N/A'}</span></div>
                                            <div className="info-item"><span className="label">Court No:</span><span className="value">{currentCase.court?.courtNumber || 'N/A'}</span></div>
                                            <div className="info-item"><span className="label">Judge:</span><span className="value">{currentCase.court?.judge || 'N/A'}</span></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Edit Actions */}
                            {isEditing && (
                                <div className="edit-actions">
                                    <button onClick={handleCancel} className="btn btn-outline">Cancel</button>
                                    <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : '💾 Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Parties Tab */}
                    {activeTab === 'parties' && (
                        <div className="tab-panel">
                            <div className="detail-grid">
                                <div className="detail-card">
                                    <h3>⚖️ Petitioner</h3>
                                    {isEditing ? (
                                        <div className="edit-form">
                                            <div className="form-group">
                                                <label>Name</label>
                                                <input value={editData.petitioner?.name || ''} onChange={(e) => updateEditField('petitioner', 'name', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Contact</label>
                                                <input value={editData.petitioner?.contactNumber || ''} onChange={(e) => updateEditField('petitioner', 'contactNumber', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input type="email" value={editData.petitioner?.email || ''} onChange={(e) => updateEditField('petitioner', 'email', e.target.value)} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="info-list">
                                            <div className="info-item"><span className="label">Name:</span><span className="value">{currentCase.petitioner?.name || 'N/A'}</span></div>
                                            <div className="info-item"><span className="label">Contact:</span><span className="value">{currentCase.petitioner?.contactNumber || 'N/A'}</span></div>
                                            <div className="info-item"><span className="label">Email:</span><span className="value">{currentCase.petitioner?.email || 'N/A'}</span></div>
                                        </div>
                                    )}
                                </div>

                                <div className="detail-card">
                                    <h3>⚔️ Respondent</h3>
                                    {isEditing ? (
                                        <div className="edit-form">
                                            <div className="form-group">
                                                <label>Name</label>
                                                <input value={editData.respondent?.name || ''} onChange={(e) => updateEditField('respondent', 'name', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Contact</label>
                                                <input value={editData.respondent?.contactNumber || ''} onChange={(e) => updateEditField('respondent', 'contactNumber', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input type="email" value={editData.respondent?.email || ''} onChange={(e) => updateEditField('respondent', 'email', e.target.value)} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="info-list">
                                            <div className="info-item"><span className="label">Name:</span><span className="value">{currentCase.respondent?.name || 'N/A'}</span></div>
                                            <div className="info-item"><span className="label">Contact:</span><span className="value">{currentCase.respondent?.contactNumber || 'N/A'}</span></div>
                                            <div className="info-item"><span className="label">Email:</span><span className="value">{currentCase.respondent?.email || 'N/A'}</span></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="edit-actions">
                                    <button onClick={handleCancel} className="btn btn-outline">Cancel</button>
                                    <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : '💾 Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Team Tab */}
                    {activeTab === 'team' && (
                        <div className="tab-panel">
                            <div className="detail-grid">
                                {/* Lead Lawyer Card */}
                                <div className="detail-card">
                                    <h3>👨‍⚖️ Lead Lawyer</h3>
                                    <div className="team-member lead">
                                        <div className="member-avatar">{currentCase.leadLawyer?.firstName?.[0] || 'L'}</div>
                                        <div className="member-info">
                                            <strong>{currentCase.leadLawyer?.firstName} {currentCase.leadLawyer?.lastName}</strong>
                                            <span>{currentCase.leadLawyer?.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Litigants/Clients Card */}
                                <div className="detail-card">
                                    <h3>👤 Litigants / Clients</h3>
                                    <div className="team-list">
                                        {currentCase.allowedUsers && currentCase.allowedUsers.length > 0 ? (
                                            currentCase.allowedUsers.map((user, idx) => (
                                                <div key={idx} className="team-member">
                                                    <div className="member-avatar">{user.firstName?.[0] || 'U'}</div>
                                                    <div className="member-info">
                                                        <strong>{user.firstName} {user.lastName}</strong>
                                                        <span>{user.email}</span>
                                                    </div>
                                                    {isLeadLawyer && (
                                                        <button className="remove-btn" onClick={() => removeFromTeam(user._id, 'litigant')}>✕</button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-members">No litigants added yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Clerks Card */}
                                <div className="detail-card">
                                    <h3>📋 Clerks</h3>
                                    <div className="team-list">
                                        {currentCase.clerks && currentCase.clerks.length > 0 ? (
                                            currentCase.clerks.map((clerk, idx) => (
                                                <div key={idx} className="team-member">
                                                    <div className="member-avatar">{clerk.firstName?.[0] || 'C'}</div>
                                                    <div className="member-info">
                                                        <strong>{clerk.firstName} {clerk.lastName}</strong>
                                                        <span>{clerk.email}</span>
                                                    </div>
                                                    {isLeadLawyer && (
                                                        <button className="remove-btn" onClick={() => removeFromTeam(clerk._id, 'clerk')}>✕</button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-members">No clerks added yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Add Team Member Section - Only for Lead Lawyer */}
                            {isLeadLawyer && (
                                <div className="detail-card add-team-card">
                                    <h3>➕ Add Team Member</h3>
                                    <div className="add-team-form">
                                        <div className="form-row">
                                            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="type-select">
                                                <option value="litigant">Litigant / Client</option>
                                                <option value="clerk">Clerk</option>
                                            </select>
                                            <input
                                                type="email"
                                                placeholder="Enter email address..."
                                                value={teamSearch}
                                                onChange={(e) => setTeamSearch(e.target.value)}
                                            />
                                            <button onClick={searchUser} className="btn btn-outline" disabled={searching}>
                                                {searching ? 'Searching...' : '🔍 Search'}
                                            </button>
                                        </div>
                                        {teamError && <p className="error-text">{teamError}</p>}
                                        {searchResult && (
                                            <div className="search-result">
                                                <div className="result-info">
                                                    <strong>✓ {searchResult.firstName} {searchResult.lastName}</strong>
                                                    <span>{searchResult.email} ({searchResult.role})</span>
                                                </div>
                                                <button onClick={addToTeam} className="btn btn-primary btn-sm">
                                                    Add to Case
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div className="tab-panel">
                            <div className="section-header">
                                <h3>📄 Case Documents</h3>
                                <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                                    + Upload Document
                                </button>
                            </div>
                            <DocumentsList caseId={currentCase._id} />
                        </div>
                    )}
                </div>
            </div>

            {showUploadModal && (
                <DocumentUploadModal
                    caseId={currentCase._id}
                    onClose={() => setShowUploadModal(false)}
                />
            )}
        </div>
    );
};

export default CaseDetailPage;
