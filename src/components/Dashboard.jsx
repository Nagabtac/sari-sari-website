import React from 'react';

function Dashboard() {
    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon-wrapper sales-bg">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                    </div>
                    <div>
                        <div className="stat-title">New Cars This Month</div>
                        <div className="stat-value">12</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrapper order-bg">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <div>
                        <div className="stat-title">Total Cars</div>
                        <div className="stat-value">86</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrapper user-bg">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div>
                        <div className="stat-title">Total Owners</div>
                        <div className="stat-value">45</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
