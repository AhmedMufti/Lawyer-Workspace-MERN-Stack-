import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCaseById } from '../../store/slices/caseSlice';

const CaseDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentCase, loading } = useSelector((state) => state.cases);

    useEffect(() => {
        dispatch(fetchCaseById(id));
    }, [dispatch, id]);

    if (loading) return <div className="loading-state"><div className="spinner-large"></div></div>;
    if (!currentCase) return <div>Case not found</div>;

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
