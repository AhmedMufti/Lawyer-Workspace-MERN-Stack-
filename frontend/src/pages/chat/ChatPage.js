import React from 'react';

const ChatPage = () => {
    return (
        <div className="chat-page">
            <div className="container">
                <h1 className="page-title">Bar Chat Rooms</h1>
                <div className="chat-container">
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <p>Chat rooms will be available here</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
