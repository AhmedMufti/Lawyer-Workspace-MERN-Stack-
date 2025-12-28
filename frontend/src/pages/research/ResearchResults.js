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
            <div className="result-icon">
                <FaBook />
            </div>
            <div className="result-content">
                <h3>{act.title}</h3>
                <div className="result-meta">
                    <span className="badge">{act.year}</span>
                    <span className="badge category">{act.category}</span>
                    <span className="badge jurisdiction">{act.jurisdiction}</span>
                </div>
                <p className="result-description">{act.description ? act.description.substring(0, 150) + '...' : 'No description available.'}</p>
            </div>
            <div className="result-actions">
                <button className="btn btn-sm btn-outline" onClick={() => onView(act)}>
                    <FaEye /> View
                </button>
                <button className="btn btn-sm btn-primary" onClick={() => onDownload(act, 'pdf')}>
                    <FaDownload /> PDF
                </button>
            </div>
        </div>
    );

    const renderCaseLawCard = (caseLaw) => (
        <div key={caseLaw._id} className="result-card case-card">
            <div className="result-icon">
                <FaGavel />
            </div>
            <div className="result-content">
                <h3>{caseLaw.caseTitle}</h3>
                <div className="result-meta">
                    <span className="citation">{caseLaw.citation}</span>
                    <span className="badge court">{caseLaw.court}</span>
                    <span className="date">{new Date(caseLaw.decisionDate).toLocaleDateString()}</span>
                </div>
                <div className="keywords">
                    {caseLaw.keywords && caseLaw.keywords.slice(0, 3).map((kw, i) => (
                        <span key={i} className="keyword-tag">{kw}</span>
                    ))}
                </div>
            </div>
            <div className="result-actions">
                <button className="btn btn-sm btn-outline" onClick={() => onView(caseLaw)}>
                    <FaEye /> Read
                </button>
                <button className="btn btn-sm btn-primary" onClick={() => onDownload(caseLaw, 'pdf')}>
                    <FaDownload /> PDF
                </button>
            </div>
        </div>
    );

    const renderFormCard = (form) => (
        <div key={form._id} className="result-card form-card">
            <div className="result-icon">
                <FaFileAlt />
            </div>
            <div className="result-content">
                <h3>{form.formTitle}</h3>
                <div className="result-meta">
                    <span className="form-number">Form #{form.formNumber}</span>
                    <span className="badge category">{form.category}</span>
                </div>
            </div>
            <div className="result-actions">
                {form.wordDocPath && (
                    <button className="btn btn-sm btn-outline" onClick={() => onDownload(form, 'word')}>
                        <FaFilePdf /> Word
                    </button>
                )}
                <button className="btn btn-sm btn-primary" onClick={() => onDownload(form, 'pdf')}>
                    <FaDownload /> PDF
                </button>
            </div>
        </div>
    );

    return (
        <div className="research-results-list">
            {type === 'acts' && results.map(renderActCard)}
            {type === 'cases' && results.map(renderCaseLawCard)}
            {type === 'forms' && results.map(renderFormCard)}
        </div>
    );
};

export default ResearchResults;
