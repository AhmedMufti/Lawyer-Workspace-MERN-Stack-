import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://lawyer-workspace-mern-stack.onrender.com', // Fallback to Render URL
    withCredentials: true
});

export default api;
