import React from 'react';

const MarketplacePage = () => {
    return (
        <div className="marketplace-page">
            <div className="container">
                <h1 className="page-title">Marketplace</h1>
                <p className="page-subtitle">Find lawyers and legal professionals</p>
                <div className="marketplace-grid">
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <p>Marketplace listings will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplacePage;
