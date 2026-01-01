import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResearchResults from './ResearchResults';
import './ResearchPage.css';
import { FaSearch, FaFilter } from 'react-icons/fa';

const ResearchPage = () => {
    const [activeTab, setActiveTab] = useState('acts');
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    // Initial fetch when tab changes
    useEffect(() => {
        setResults([]);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchData(activeTab, '', 1);
    }, [activeTab]);

    const fetchData = async (type, query, page) => {
        setLoading(true);
        try {
            let endpoint = '';
            let params = { page, limit: 10 };

            // Determine endpoint based on tab and query
            if (query) {
                params.query = query;
                if (type === 'acts') endpoint = '/api/research/acts/search';
                else if (type === 'cases') endpoint = '/api/research/case-laws/search';
                else if (type === 'forms') endpoint = '/api/research/forms/search';
            } else {
                if (type === 'acts') endpoint = '/api/research/acts';
                else if (type === 'cases') endpoint = '/api/research/case-laws';
                else if (type === 'forms') endpoint = '/api/research/forms';
            }

            const response = await axios.get(endpoint, { params });
            const data = response.data.data;

            // Handle different response structures if any
            if (type === 'acts') setResults(data.acts || data);
            else if (type === 'cases') setResults(data.caseLaws || data);
            else if (type === 'forms') setResults(data.forms || data);

            if (response.data.pagination) {
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching research data:', error);
            // Fallback for demo purposes if backend is empty
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData(activeTab, searchQuery, 1);
    };

    const handleDownload = async (item, format) => {
        try {
            let url = '';
            let filename = '';

            if (activeTab === 'acts') {
                url = `/api/research/acts/${item._id}/download`;
                filename = `${item.title}.pdf`;
            } else if (activeTab === 'cases') {
                url = `/api/research/case-laws/${item._id}/download`;
                filename = `${item.citation}.pdf`;
            } else if (activeTab === 'forms') {
                url = `/api/research/forms/${item._id}/download?type=${format}`;
                filename = `${item.formTitle}.${format === 'word' ? 'docx' : 'pdf'}`;
            }

            const response = await axios.get(url, { responseType: 'blob' });
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. File might not be available.');
        }
    };

    const handleView = (item) => {
        console.log('View item:', item);
        // Implement view modal here
        alert(`Viewing: ${item.title || item.caseTitle || item.formTitle}`);
    };

    return (
        <div className="research-page">
            <div className="container">
                <div className="research-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Legal Research Hub</h1>
                    <p className="page-subtitle" style={{ fontSize: '1.1rem', color: '#94a3b8' }}>Access Pakistan's largest digital legal database</p>
                </div>

                <div className="tabs-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div className="tabs" style={{ display: 'flex', gap: '1rem', background: '#1e293b', padding: '0.5rem', borderRadius: '12px' }}>
                        <button
                            className={`tab ${activeTab === 'acts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('acts')}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: activeTab === 'acts' ? '#3b82f6' : 'transparent', color: activeTab === 'acts' ? 'white' : '#94a3b8', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Acts & Legislation
                        </button>
                        <button
                            className={`tab ${activeTab === 'cases' ? 'active' : ''}`}
                            onClick={() => setActiveTab('cases')}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: activeTab === 'cases' ? '#3b82f6' : 'transparent', color: activeTab === 'cases' ? 'white' : '#94a3b8', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Case Laws
                        </button>
                        <button
                            className={`tab ${activeTab === 'forms' ? 'active' : ''}`}
                            onClick={() => setActiveTab('forms')}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: activeTab === 'forms' ? '#3b82f6' : 'transparent', color: activeTab === 'forms' ? 'white' : '#94a3b8', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Court Forms
                        </button>
                    </div>
                </div>

                <div className="search-section" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '800px' }}>
                        <form onSubmit={handleSearch} className="search-bar" style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <FaSearch className="search-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab === 'acts' ? 'Acts' : activeTab === 'cases' ? 'Case Laws' : 'Forms'}...`}
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', paddingLeft: '3rem', paddingRight: '1rem', height: '50px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem', height: '50px' }}>Search</button>
                        </form>
                        <button className="btn btn-outline filter-btn" style={{ height: '50px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: 'transparent', color: 'white', cursor: 'pointer' }}>
                            <FaFilter /> Filters
                        </button>
                    </div>
                </div>

                <div className="results-grid">
                    <ResearchResults
                        results={results}
                        type={activeTab}
                        loading={loading}
                        onDownload={handleDownload}
                        onView={handleView}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResearchPage;
