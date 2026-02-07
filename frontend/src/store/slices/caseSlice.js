import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const API_URL = '/api/cases';

const initialState = {
    cases: [],
    currentCase: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0
    }
};

// Get authenticated axios instance
// const getAuthAxios = () => { ... } // Removed

// Fetch cases
export const fetchCases = createAsyncThunk(
    'cases/fetchCases',
    async ({ page = 1, limit = 10, status, type }, { rejectWithValue }) => {
        try {
            const params = { page, limit };
            if (status) params.status = status;
            if (type) params.type = type;

            const response = await api.get(API_URL, { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Get case by ID
export const fetchCaseById = createAsyncThunk(
    'cases/fetchCaseById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Create case
export const createCase = createAsyncThunk(
    'cases/createCase',
    async (caseData, { rejectWithValue }) => {
        try {
            const response = await api.post(API_URL, caseData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Update case
export const updateCase = createAsyncThunk(
    'cases/updateCase',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`${API_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Update failed' });
        }
    }
);

const caseSlice = createSlice({
    name: 'cases',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch cases
            .addCase(fetchCases.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCases.fulfilled, (state, action) => {
                state.loading = false;
                state.cases = action.payload.data;
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }
            })
            .addCase(fetchCases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch case by ID
            // Fetch case by ID
            .addCase(fetchCaseById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.currentCase = null;
            })
            .addCase(fetchCaseById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCase = action.payload.data.case;
                state.error = null;
            })
            .addCase(fetchCaseById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.currentCase = null;
            })
            // Create case
            .addCase(createCase.fulfilled, (state, action) => {
                state.cases.unshift(action.payload.data.case);
            })
            // Update case
            .addCase(updateCase.fulfilled, (state, action) => {
                state.currentCase = action.payload.data.case;
                // Update in cases list too
                const index = state.cases.findIndex(c => c._id === action.payload.data.case._id);
                if (index !== -1) {
                    state.cases[index] = action.payload.data.case;
                }
            });
    }
});

export const { clearError } = caseSlice.actions;
export default caseSlice.reducer;
