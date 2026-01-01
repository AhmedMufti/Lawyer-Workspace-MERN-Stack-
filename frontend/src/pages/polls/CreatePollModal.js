import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import '../cases/CasesPage.css'; // Reusing modal styles

const CreatePollModal = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [options, setOptions] = useState(['', '']); // Start with 2 empty options
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!title.trim() || !endDate) {
            setError('Please fill in all required fields.');
            return;
        }
        if (options.some(opt => !opt.trim())) {
            setError('All options must have text.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Ensure endDate is set to the end of the selected day
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);

            const payload = {
                title,
                description,
                endDate: endOfDay,
                options: options.map(opt => ({ optionText: opt })),
                pollType: 'Opinion',
                targetAudience: { barAssociation: 'All Bars' }
            };

            await axios.post('/api/polls', payload, config);
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error creating poll:', err);
            setError(err.response?.data?.message || 'Failed to create poll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>Create New Poll</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                    <div className="form-group">
                        <label>Poll Title *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Annual Bar Association Dinner Date"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="form-control"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide some context..."
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Voting Options *</label>
                        {options.map((option, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    required
                                />
                                {options.length > 2 && (
                                    <button type="button" className="btn btn-outline-danger" onClick={() => removeOption(index)} style={{ padding: '0.5rem' }}>
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="btn btn-sm btn-secondary" onClick={addOption} style={{ marginTop: '0.5rem' }}>
                            <FaPlus /> Add Option
                        </button>
                    </div>

                    <div className="form-group">
                        <label>End Date *</label>
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="modal-footer" style={{ marginTop: '2rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Poll'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePollModal;
