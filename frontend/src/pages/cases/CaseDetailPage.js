import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCaseById } from '../../store/slices/caseSlice';
import DocumentsList from './DocumentsList';
import DocumentUploadModal from './DocumentUploadModal';

const CaseDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentCase, loading, error } = useSelector((state) => state.cases);
    const { user } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = React.useState('overview');
    const [showUploadModal, setShowUploadModal] = React.useState(false);

    useEffect(() => {
        dispatch(fetchCaseById(id));
    }, [dispatch, id]);

    if (loading) return <div className="loading-state"><div className="spinner-large"></div></div>;

    if (error) {
        return (
            <div className="container" style={{ paddingTop: '2rem' }}>
                <div className="alert alert-error">
                    <h3>Error Loading Case</h3>
                    <p>{error?.message || 'Could not load case details.'}</p>
                    <button onClick={() => window.history.back()} className="btn btn-outline" style={{ marginTop: '1rem' }}>
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
                <div className="detail-header">
                    <div>
                        <h1>{currentCase.caseTitle}</h1>
                        <div className="flex-row gap-2">
                            <span className={`status-badge status-${currentCase.caseStatus?.toLowerCase().replace(' ', '-')}`}>
                                {currentCase.caseStatus}
                            </span>
                            <span className="badge badge-outline">{currentCase.caseType}</span>
                        </div>
                    </div>
                </div>

                <div className="tabs-nav">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                        onClick={() => setActiveTab('documents')}
                    >
                        Documents
                    </button>
                </div>

                <div className="detail-content">
                    {activeTab === 'overview' ? (
                        <div className="detail-section">
                            <h3>Case Information</h3>
                            <p><strong>Case Number:</strong> {currentCase.caseNumber}</p>
                            <p><strong>Type:</strong> {currentCase.caseType}</p>
                            <p><strong>Filing Date:</strong> {new Date(currentCase.filingDate).toLocaleDateString()}</p>
                            <p><strong>Validation Status:</strong> {currentCase.validationStatus || 'Verified'}</p>
                            <div className="mt-4">
                                <strong>Description:</strong>
                                <p className="text-muted">{currentCase.description}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="documents-section">
                            <div className="section-header flex-between mb-4">
                                <h3>Case Documents</h3>
                                <button className="btn btn-primary btn-sm" onClick={() => setShowUploadModal(true)}>
                                    + Upload New
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
