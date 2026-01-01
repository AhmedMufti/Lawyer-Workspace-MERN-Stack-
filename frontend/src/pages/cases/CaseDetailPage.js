import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCaseById } from '../../store/slices/caseSlice';

const CaseDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentCase, loading, error } = useSelector((state) => state.cases);

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
                    <h1>{currentCase.caseTitle}</h1>
                    <span className={`status-badge status-${currentCase.caseStatus?.toLowerCase().replace(' ', '-')}`}>
                        {currentCase.caseStatus}
                    </span>
                </div>
                <div className="detail-content">
                    <div className="detail-section">
                        <h3>Case Information</h3>
                        <p><strong>Case Number:</strong> {currentCase.caseNumber}</p>
                        <p><strong>Type:</strong> {currentCase.caseType}</p>
                        <p><strong>Description:</strong> {currentCase.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseDetailPage;
