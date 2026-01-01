import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCaseDocuments, deleteDocument } from '../../store/slices/documentSlice';

const DocumentsList = ({ caseId }) => {
    const dispatch = useDispatch();
    const { documents, loading, error } = useSelector((state) => state.documents);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (caseId) {
            dispatch(fetchCaseDocuments(caseId));
        }
    }, [dispatch, caseId]);

    const handleDelete = (docId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            dispatch(deleteDocument(docId));
        }
    };

    const handleDownload = (docId, fileName) => {
        // Create a direct download link using the backend API
        // Assuming the backend has a download route like /api/documents/:id/download through getDocumentById or similar
        // For security with JWT, we might need a specific action or use fetch with headers to get a blob
        // For simplicity in this "Simple Document Upload" task, we'll try a direct window open if it's a public/protected route handling cookies, 
        // OR better: use a function to fetch blob.

        // Let's use a simpler approach: open in new tab if it serves the file, or just log for now if complex.
        // But referencing the backend controller: `exports.downloadDocument` at `/api/documents/:id/download`.
        // Since it requires a token, `window.open` might fail if token is in header not cookie.
        // We'll use a fetch-based download helper.
        downloadFile(docId, fileName);
    };

    const downloadFile = async (docId, fileName) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/documents/${docId}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            alert('Failed to download file: ' + err.message);
        }
    };

    if (loading && documents.length === 0) {
        return <div className="loading-state"><div className="spinner-small"></div> Loading documents...</div>;
    }

    if (error) {
        return <div className="alert alert-error">{error.message || 'Error loading documents'}</div>;
    }

    if (!documents || documents.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📄</div>
                <p>No documents uploaded yet</p>
                <p className="text-small text-muted">Upload contracts, evidence, or court orders.</p>
            </div>
        );
    }

    return (
        <div className="documents-list">
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Uploaded By</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc._id}>
                                <td>
                                    <div className="doc-name-cell">
                                        <span className="doc-icon">📄</span>
                                        <div>
                                            <div className="doc-name">{doc.documentTitle}</div>
                                            <div className="doc-info text-small text-muted">
                                                {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge">{doc.documentType}</span></td>
                                <td>{doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}</td>
                                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleDownload(doc._id, doc.originalFileName)}
                                            title="Download"
                                        >
                                            ⬇️
                                        </button>
                                        {(user?.role === 'lawyer' || user?._id === doc.uploadedBy?._id) && (
                                            <button
                                                className="btn-icon btn-danger"
                                                onClick={() => handleDelete(doc._id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DocumentsList;
