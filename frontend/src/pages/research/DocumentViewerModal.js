import React from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';
import './DocumentViewerModal.css';

const DocumentViewerModal = ({ isOpen, onClose, document, onDownload }) => {
    if (!isOpen || !document) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content document-viewer">
                <div className="modal-header">
                    <h2>{document.title || document.caseTitle || document.formTitle}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="document-meta">
                        {document.year && <span className="badge">{document.year}</span>}
                        {document.category && <span className="badge category">{document.category}</span>}
                        {document.jurisdiction && <span className="badge jurisdiction">{document.jurisdiction}</span>}
                        {document.court && <span className="badge court">{document.court}</span>}
                    </div>

                    <div className="document-abstract">
                        <h3>Abstract / Summary</h3>
                        <p>{document.description || document.judgmentRef || "No summary available for this document."}</p>
                    </div>

                    {document.keywords && (
                        <div className="document-keywords">
                            <h3>Keywords</h3>
                            <div className="keyword-list">
                                {document.keywords.map((kw, i) => (
                                    <span key={i} className="keyword-tag">{kw}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Close</button>
                    <button className="btn btn-primary" onClick={() => onDownload(document, 'pdf')}>
                        <FaDownload /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewerModal;
