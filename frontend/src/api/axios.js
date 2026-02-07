import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || 'https://lawyer-workspace-mern-stack.onrender.com';
console.log('🔌 API Base URL:', baseURL); // DEBUG: Check what the browser is actually using

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true
});

export default api;
