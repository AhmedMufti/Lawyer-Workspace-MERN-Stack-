import React from 'react';
import { useSelector } from 'react-redux';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="profile-page">
            <div className="container">
                <h1 className="page-title">My Profile</h1>
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</div>
                        <div className="profile-info">
                            <h2>{user?.firstName} {user?.lastName}</h2>
                            <p>{user?.email}</p>
                            <span className="role-badge">{user?.role}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
