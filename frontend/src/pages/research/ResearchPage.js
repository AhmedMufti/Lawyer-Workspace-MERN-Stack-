import React, { useState } from 'react';
import './ResearchPage.css';

const ResearchPage = () => {
    const [activeTab, setActiveTab] = useState('acts');

    return (
        <div className="research-page">
            <div className="container">
                <h1 className="page-title">Legal Research</h1>
                <div className="tabs">
                    <button className={activeTab === 'acts' ? 'tab active' : 'tab'} onClick={() => setActiveTab('acts')}>Acts & Legislation</button>
                    <button className={activeTab === 'cases' ? 'tab active' : 'tab'} onClick={() => setActiveTab('cases')}>Case Laws</button>
                    <button className={activeTab === 'forms' ? 'tab active' : 'tab'} onClick={() => setActiveTab('forms')}>Court Forms</button>
                </div>
                <div className="search-section">
                    <input type="text" placeholder="Search legal documents..." className="search-input" />
                    <button className="btn btn-primary">Search</button>
                </div>
                <div className="results-grid">
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <p>Start searching for legal documents</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearchPage;
