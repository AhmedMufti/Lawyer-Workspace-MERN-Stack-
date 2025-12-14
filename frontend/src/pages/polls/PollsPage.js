import React from 'react';

const PollsPage = () => {
    return (
        <div className="polls-page">
            <div className="container">
                <h1 className="page-title">Polls & Elections</h1>
                <div className="polls-grid">
                    <div className="empty-state">
                        <div className="empty-icon">🗳️</div>
                        <p>Active polls will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PollsPage;
