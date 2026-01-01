import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/dashboard';

const initialState = {
    stats: {
        cases: { total: 0, active: 0, completed: 0 },
        hearings: 0,
        documents: 0
    },
    upcomingHearings: [],
    recentActivity: [],
    loading: false,
    error: null
};

// Get authenticated axios instance
const getAuthAxios = () => {
    const token = localStorage.getItem('accessToken');
    return axios.create({
        baseURL: API_URL,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Fetch Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const authAxios = getAuthAxios();
            const response = await authAxios.get('/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload.data.stats;
                state.upcomingHearings = action.payload.data.upcomingHearings;
                state.recentActivity = action.payload.data.recentActivity;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
