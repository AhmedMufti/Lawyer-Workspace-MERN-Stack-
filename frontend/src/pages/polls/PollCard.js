import React, { useState } from 'react';
import axios from 'axios';
import { FaVoteYea } from 'react-icons/fa';

const PollCard = ({ poll, onVoteSuccess }) => {
    const [voting, setVoting] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    // Check if user has voted (in a real app, this would be checked against user ID in votes array)
    // For now, we assume if we show results, they voted. 
    // Ideally, the backend 'poll' object should have a 'userVoted' flag or similar.
    // Based on the controller, we don't see that flag explicitly. 
    // We'll rely on the UI state for the session or just show buttons.

    // Calculate total votes for display
    const totalVotes = poll.totalVotes || 0;

    const handleVote = async (optionId) => {
        setVoting(true);
        setSelectedOption(optionId);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`/api/polls/${poll._id}/vote`, { optionId }, config);
            alert('Vote cast successfully!');
            if (onVoteSuccess) onVoteSuccess();
        } catch (error) {
            console.error('Voting failed:', error);
            alert(error.response?.data?.message || 'Voting failed');
        } finally {
            setVoting(false);
        }
    };

    return (
        <div className="poll-card">
            <div className="poll-header">
                <h3>{poll.title}</h3>
                <span className={`poll-status ${poll.status.toLowerCase()}`}>{poll.status}</span>
            </div>

            <p className="poll-description">{poll.description}</p>

            <div className="poll-options">
                {poll.options.map((option) => {
                    const percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;

                    return (
                        <div key={option._id} className="poll-option">
                            <button
                                className={`vote-btn ${selectedOption === option._id ? 'selected' : ''}`}
                                onClick={() => handleVote(option._id)}
                                disabled={voting || poll.status !== 'Active'}
                            >
                                <div className="option-text">
                                    <span>{option.text}</span>
                                    {poll.status === 'Closed' && <span className="percentage">{percentage}%</span>}
                                </div>
                                {poll.status === 'Closed' && (
                                    <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="poll-footer">
                <span className="vote-count"><FaVoteYea /> {totalVotes} votes</span>
                <span className="poll-expiry">Ends: {new Date(poll.expiresAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default PollCard;
