import React from 'react';
import { FaFilePdf, FaBook, FaGavel, FaFileAlt, FaDownload, FaEye } from 'react-icons/fa';

const ResearchResults = ({ results, type, loading, onDownload, onView }) => {
    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Searching database...</p>
            </div>
        );
    }

    if (!results || results.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>No documents found matching your search.</p>
            </div>
        );
    }

    const renderActCard = (act) => (
        <div key={act._id} className="result-card act-card">
            <div className="result-header">
                <div className="result-icon-wrapper">
                    <FaBook />
                </div>
                <div>
                    <h3 className="result-title">{act.title}</h3>
                    <span className="result-subtitle">{act.shortTitle} • {act.year}</span>
                </div>
            </div>

            <div className="result-meta">
                <span className="badge badge-outline">{act.category}</span>
                <span className="badge badge-outline">{act.jurisdiction}</span>
                <span className="badge badge-outline" style={{ color: act.status === 'Active' ? '#10b981' : '#ef4444' }}>{act.status}</span>
            </div>

            <div className="keyword-tags">
                {act.keywords && act.keywords.slice(0, 4).map((kw, i) => (
                    <span key={i} className="keyword-tag">#{kw}</span>
                ))}
            </div>

            <div className="result-actions">
                <button className="action-btn btn-view" onClick={() => onView(act)}>
                    <FaEye /> View
                </button>
                <button className="action-btn btn-download" onClick={() => onDownload(act, 'pdf')}>
                    <FaDownload /> PDF
                </button>
            </div>
        </div>
    );

    const renderCaseLawCard = (caseLaw) => (
        <div key={caseLaw._id} className="result-card case-card">
            <div className="result-header">
                <div className="result-icon-wrapper">
                    <FaGavel />
                </div>
                <div>
                    <h3 className="result-title">{caseLaw.caseTitle}</h3>
                    <span className="result-subtitle">{caseLaw.citation} • {new Date(caseLaw.decisionDate).getFullYear()}</span>
                </div>
            </div>

            <div className="result-meta">
                <span className="badge badge-outline">{caseLaw.court}</span>
                <span className="badge badge-outline">{caseLaw.caseType}</span>
                <span className="badge badge-outline" style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>{caseLaw.importance}</span>
            </div>

            <div className="keyword-tags">
                {caseLaw.keywords && caseLaw.keywords.slice(0, 4).map((kw, i) => (
                    <span key={i} className="keyword-tag">#{kw}</span>
                ))}
            </div>

            <div className="result-actions">
                <button className="action-btn btn-view" onClick={() => onView(caseLaw)}>
                    <FaEye /> Read
                </button>
                <button className="action-btn btn-download" onClick={() => onDownload(caseLaw, 'pdf')}>
                    <FaDownload /> PDF
                </button>
            </div>
        </div>
    );

    const renderFormCard = (form) => (
        <div key={form._id} className="result-card form-card">
            <div className="result-header">
                <div className="result-icon-wrapper">
                    <FaFileAlt />
                </div>
                <div>
                    <h3 className="result-title">{form.formTitle}</h3>
                    <span className="result-subtitle">Form #{form.formNumber}</span>
                </div>
            </div>

            <div className="result-meta">
                <span className="badge badge-outline">{form.category}</span>
                <span className="badge badge-outline">{form.jurisdiction || 'Universal'}</span>
            </div>

            <div className="keyword-tags">
                <span className="keyword-tag" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>Fillable PDF</span>
            </div>

            <div className="result-actions">
                {form.wordDocPath && (
                    <button className="action-btn btn-view" onClick={() => onDownload(form, 'word')}>
                        <FaFilePdf /> Word
                    </button>
                )}
                <button className="action-btn btn-download" onClick={() => onDownload(form, 'pdf')}>
                    <FaDownload /> PDF
                </button>
            </div>
        </div>
    );

    return (
        <div className="research-results-list" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem'
        }}>
            {type === 'acts' && results.map(renderActCard)}
            {type === 'cases' && results.map(renderCaseLawCard)}
            {type === 'forms' && results.map(renderFormCard)}
        </div>
    );
};

export default ResearchResults;
