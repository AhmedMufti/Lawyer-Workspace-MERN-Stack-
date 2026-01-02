import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/auth';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

// Load user from localStorage
const userFromStorage = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

const tokenFromStorage = localStorage.getItem('accessToken') || null;

const initialState = {
    user: userFromStorage,
    token: tokenFromStorage,
    isAuthenticated: !!tokenFromStorage,
    loading: false,
    error: null,
    success: false
};

// Register user
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            return response.data;
        } catch (error) {
            // Handle network errors or missing response
            if (!error.response) {
                return rejectWithValue({
                    message: 'Network error. Please check if the server is running.'
                });
            }
            return rejectWithValue(error.response.data);
        }
    }
);

// Login user
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            const { data } = response.data;

            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            return data;
        } catch (error) {
            // Handle network errors or missing response
            if (!error.response) {
                return rejectWithValue({
                    message: 'Network error. Please check if the server is running.'
                });
            }
            return rejectWithValue(error.response.data);
        }
    }
);

// Logout user
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            // Call backend to clear cookies
            await axios.post(`${API_URL}/logout`);
        } catch (error) {
            // Continue with local cleanup even if API fails
            console.error('Logout API error:', error);
        } finally {
            // Always clear localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
        return true;
    }
);

// Update user profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${API_URL}/me`, userData);
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        // Manual logout (without API call)
        logoutLocal: (state) => {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.accessToken;
                state.success = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            })
            // Logout
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.success = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state) => {
                // Still clear state even if API fails
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            // Update Profile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.user = action.payload.data.user;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    }
});

export const { clearError, clearSuccess, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
