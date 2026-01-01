import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import './i18n';
import './index.css';
import App from './App';

// Axios Interceptor for Token Expiry & Headers
import axios from 'axios';
import { logoutLocal } from './store/slices/authSlice';

// Add a request interceptor to attach token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // If token expired or unauthorized, logout
            store.dispatch(logoutLocal());
            // Optionally redirect to login
            // window.location.href = '/login';
        }
        return Promise.reject(error);
        return Promise.reject(error);
    }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);
