import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PollCard from './PollCard';
import './PollCard.css';
import { FaPoll } from 'react-icons/fa';

import CreatePollModal from './CreatePollModal';

const PollsPage = () => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Active');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchPolls();
    }, [activeTab]);

    const fetchPolls = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 10,
                status: activeTab
            };

            const response = await axios.get('/api/polls', { params });
            setPolls(response.data.data.items || response.data.data);
        } catch (error) {
            console.error('Error fetching polls:', error);
            setPolls([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVoteSuccess = () => {
        fetchPolls(); // Refresh to update vote counts
    };

    return (
        <div className="polls-page">
            <div className="container">
                <div className="polls-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Bar Association Elections</h1>
                        <p className="page-subtitle">Participate in opinion polls and view election trends</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        + Create New Poll
                    </button>
                </div>

                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'Active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('Active')}
                        >
                            Active Polls
                        </button>
                        <button
                            className={`tab ${activeTab === 'Closed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('Closed')}
                        >
                            Past Results
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading polls...</p>
                    </div>
                ) : (
                    <div className="polls-grid">
                        {polls.length > 0 ? (
                            polls.map(poll => (
                                <PollCard
                                    key={poll._id}
                                    poll={poll}
                                    onVoteSuccess={handleVoteSuccess}
                                />
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📊</div>
                                <p>No {activeTab.toLowerCase()} polls found at the moment.</p>
                            </div>
                        )}
                    </div>
                )}

                {showCreateModal && (
                    <CreatePollModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            fetchPolls();
                            setActiveTab('Active');
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default PollsPage;
