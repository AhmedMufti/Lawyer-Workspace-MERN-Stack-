import React from 'react';
import { FaTimes, FaFilePdf, FaDownload } from 'react-icons/fa';
import './DocumentViewer.css';

const DocumentViewer = ({ document, type, onClose, onDownload }) => {
    if (!document) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content document-modal">
                <div className="modal-header">
                    <h2>{document.title || document.caseTitle || document.formTitle}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="document-meta-grid">
                        {type === 'acts' && (
                            <>
                                <div className="meta-item">
                                    <label>Year</label>
                                    <span>{document.year}</span>
                                </div>
                                <div className="meta-item">
                                    <label>Category</label>
                                    <span>{document.category}</span>
                                </div>
                                <div className="meta-item">
                                    <label>Jurisdiction</label>
                                    <span>{document.jurisdiction}</span>
                                </div>
                                <div className="meta-item">
                                    <label>Status</label>
                                    <span className={`status-badge ${document.status.toLowerCase()}`}>{document.status}</span>
                                </div>
                            </>
                        )}
                        {type === 'cases' && (
                            <>
                                <div className="meta-item">
                                    <label>Citation</label>
                                    <span>{document.citation}</span>
                                </div>
                                <div className="meta-item">
                                    <label>Court</label>
                                    <span>{document.court}</span>
                                </div>
                                <div className="meta-item">
                                    <label>Date</label>
                                    <span>{new Date(document.decisionDate).toLocaleDateString()}</span>
                                </div>
                                <div className="meta-item">
                                    <label>Importance</label>
                                    <span>{document.importance}</span>
                                </div>
                            </>
                        )}
                        {type === 'forms' && (
                            <>
                                <div className="meta-item">
                                    <label>Form Number</label>
                                    <span>{document.formNumber}</span>
                                </div>
                                <div className="meta-item">
                                    <label>Category</label>
                                    <span>{document.category}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="document-content-preview">
                        <h3>Full Text / Summary</h3>
                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                            {document.fullText || document.judgmentText || document.purpose || "Content preview not available."}
                        </p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn btn-primary" onClick={() => onDownload(document, 'pdf')}>
                        <FaDownload /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
