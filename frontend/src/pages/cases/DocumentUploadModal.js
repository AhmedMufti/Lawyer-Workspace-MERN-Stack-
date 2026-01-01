import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument } from '../../store/slices/documentSlice';

const DocumentUploadModal = ({ caseId, onClose }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.documents);

    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Evidence');
    const [category, setCategory] = useState('Internal');
    const [description, setDescription] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            if (!title) {
                setTitle(e.target.files[0].name);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentTitle', title);
        formData.append('documentType', type);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('caseId', caseId);

        const result = await dispatch(uploadDocument({ caseId, formData }));

        if (uploadDocument.fulfilled.match(result)) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Upload Document</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {error && <div className="alert alert-error">{error.message || 'Upload failed'}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select File*</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Document Title*</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="form-control"
                            placeholder="e.g., Contract V1"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label>Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} className="form-control">
                                <option value="Evidence">Evidence</option>
                                <option value="Contract">Contract</option>
                                <option value="Court Order">Court Order</option>
                                <option value="Notice">Notice</option>
                                <option value="Invoice">Invoice</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group half">
                            <label>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-control">
                                <option value="Internal">Internal</option>
                                <option value="Court Filing">Court Filing</option>
                                <option value="Client Document">Client Document</option>
                                <option value="Evidence">Evidence</option>
                                <option value="Reference">Reference</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-control"
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-text" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentUploadModal;
