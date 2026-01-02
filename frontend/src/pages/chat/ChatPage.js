import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { FaPaperPlane, FaBars, FaTimes, FaHashtag, FaUserCircle, FaInfoCircle } from 'react-icons/fa';
import './ChatPage.css';

const SOCKET_ENDPOINT = 'http://localhost:5000';

const ChatPage = () => {
    const { user } = useSelector(state => state.auth);
    const location = useLocation();
    const [socket, setSocket] = useState(null);

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeRoom, setActiveRoom] = useState(null);

    // Data State
    const [publicRooms, setPublicRooms] = useState([]);
    const [privateRooms, setPrivateRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);

    // Parse Query Params for initial room
    const queryParams = new URLSearchParams(location.search);
    const initialRoomId = queryParams.get('roomId');

    // 1. Initialize Socket
    useEffect(() => {
        if (!user) return;

        // Get accessToken from localStorage
        const token = localStorage.getItem('accessToken');

        const newSocket = io(SOCKET_ENDPOINT, {
            auth: { token }
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [user]);

    // 2. Fetch Rooms
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                // Fetch Public Rooms
                const pubRes = await axios.get('/api/chat/rooms');
                setPublicRooms(pubRes.data.data.rooms.filter(r => r.roomType !== 'Private'));

                // Fetch My DMs
                const privRes = await axios.get('/api/chat/rooms?mine=true&roomType=Private');
                setPrivateRooms(privRes.data.data.rooms);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching rooms:', err);
                setLoading(false);
            }
        };

        if (user) fetchRooms();
    }, [user]);

    // 3. Set Initial Room if link provided
    useEffect(() => {
        if (initialRoomId && !loading && (publicRooms.length || privateRooms.length)) {
            const room = [...publicRooms, ...privateRooms].find(r => r._id === initialRoomId);
            if (room) {
                setActiveRoom(room);
            } else {
                // Fetch specific room details if not in list (edge case)
                // For MVP assume it's in fetched list or just refresh
            }
        }
    }, [initialRoomId, loading, publicRooms, privateRooms]);

    // 4. Join Room & Fetch Messages
    useEffect(() => {
        if (!activeRoom || !socket) return;

        // Join Socket Room
        socket.emit('join_room', activeRoom._id);

        // Fetch History
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`/api/chat/rooms/${activeRoom._id}/messages`);
                setMessages(res.data.data);
                scrollToBottom();
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        };

        fetchMessages();

        // Listen for incoming
        const handleReceiveMessage = (message) => {
            // Check if message belongs to current room
            if (message.room === activeRoom._id || message.room._id === activeRoom._id) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.emit('leave_room', activeRoom._id);
        };
    }, [activeRoom, socket]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !activeRoom) return;

        const messageData = {
            roomId: activeRoom._id,
            content: newMessage
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    const getRoomName = (room) => {
        if (room.roomType === 'Private') {
            // Find other user name
            // roomName is stored as "User1 & User2" usually or we parse members
            // For now use room.roomName
            return room.roomName.replace(user.firstName, '').replace('&', '').trim() || room.roomName;
        }
        return room.roomName;
    };

    return (
        <div className="chat-page">
            <div className="chat-container">
                {/* Mobile Toggle */}
                <button
                    className="mobile-menu-btn"
                    style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 30, display: window.innerWidth > 768 ? 'none' : 'block' }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <FaBars />
                </button>

                {/* Sidebar */}
                <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h2>Chats</h2>
                    </div>

                    <div className="room-list">
                        {/* Private Chats */}
                        {privateRooms.length > 0 && (
                            <div className="room-category">
                                <div className="category-title">Direct Messages</div>
                                {privateRooms.map(room => (
                                    <div
                                        key={room._id}
                                        className={`room-item ${activeRoom?._id === room._id ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveRoom(room);
                                            setSidebarOpen(false);
                                        }}
                                    >
                                        <div className="room-icon"><FaUserCircle /></div>
                                        <div className="room-info">
                                            <div className="room-name">{getRoomName(room)}</div>
                                            <div className="room-last-msg">Click to chat</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Public Rooms */}
                        <div className="room-category">
                            <div className="category-title">Bar Rooms</div>
                            {publicRooms.map(room => (
                                <div
                                    key={room._id}
                                    className={`room-item ${activeRoom?._id === room._id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveRoom(room);
                                        setSidebarOpen(false);
                                    }}
                                >
                                    <div className="room-icon"><FaHashtag /></div>
                                    <div className="room-info">
                                        <div className="room-name">{room.roomName}</div>
                                        <div className="room-last-msg">{room.messageCount} messages</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Window */}
                <div className="chat-window">
                    {activeRoom ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <h3>{getRoomName(activeRoom)}</h3>
                                    <div className="chat-header-sub">{activeRoom.roomType === 'Private' ? 'Private Conversation' : `${activeRoom.barAssociation}`}</div>
                                </div>
                                <FaInfoCircle style={{ color: '#94a3b8', cursor: 'pointer' }} />
                            </div>

                            <div className="chat-messages">
                                {messages.map((msg, idx) => {
                                    // Handle different sender formats (populated object vs just ID)
                                    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                                    const currentUserId = user._id || user.id;
                                    const isMine = String(senderId) === String(currentUserId);
                                    const senderName = typeof msg.sender === 'object' ? msg.sender.firstName : 'User';

                                    return (
                                        <div key={msg._id || idx} className={`message ${isMine ? 'sent' : 'received'}`}>
                                            <div className="message-bubble">
                                                {msg.content}
                                            </div>
                                            <div className="message-info">
                                                <span className="message-sender">{isMine ? 'You' : senderName}</span>
                                                <span className="message-time">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input-area">
                                <form className="input-form" onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        className="chat-input"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="send-btn"
                                        disabled={!newMessage.trim()}
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="empty-chat-state">
                            <div className="empty-chat-icon">💬</div>
                            <h2>Select a conversation</h2>
                            <p>Choose a room from the sidebar to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
