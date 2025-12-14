import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/cases';

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
const getAuthAxios = () => {
    const token = localStorage.getItem('accessToken');
    return axios.create({
        baseURL: API_URL,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Fetch cases
export const fetchCases = createAsyncThunk(
    'cases/fetchCases',
    async ({ page = 1, limit = 10, status, type }, { rejectWithValue }) => {
        try {
            const authAxios = getAuthAxios();
            const params = { page, limit };
            if (status) params.status = status;
            if (type) params.type = type;

            const response = await authAxios.get('/', { params });
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
            const authAxios = getAuthAxios();
            const response = await authAxios.get(`/${id}`);
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
            const authAxios = getAuthAxios();
            const response = await authAxios.post('/', caseData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
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
            .addCase(fetchCaseById.fulfilled, (state, action) => {
                state.currentCase = action.payload.data.case;
            })
            // Create case
            .addCase(createCase.fulfilled, (state, action) => {
                state.cases.unshift(action.payload.data.case);
            });
    }
});

export const { clearError } = caseSlice.actions;
export default caseSlice.reducer;
