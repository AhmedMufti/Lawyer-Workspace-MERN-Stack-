import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const API_URL = '/api/documents';

const initialState = {
    documents: [],
    loading: false,
    error: null,
    uploadProgress: 0
};

// Fetch documents for a case
export const fetchCaseDocuments = createAsyncThunk(
    'documents/fetchCaseDocuments',
    async (caseId, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_URL}/case/${caseId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Upload document
export const uploadDocument = createAsyncThunk(
    'documents/uploadDocument',
    async ({ caseId, formData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`${API_URL}/${caseId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    // We can dispatch progress updates here if needed, 
                    // but for now we'll just handle the final result
                }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Delete document
export const deleteDocument = createAsyncThunk(
    'documents/deleteDocument',
    async (documentId, { rejectWithValue }) => {
        try {
            await api.delete(`${API_URL}/${documentId}`);
            return documentId;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const documentSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        clearDocumentError: (state) => {
            state.error = null;
        },
        resetUploadProgress: (state) => {
            state.uploadProgress = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Documents
            .addCase(fetchCaseDocuments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCaseDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = action.payload.data;
            })
            .addCase(fetchCaseDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload Document
            .addCase(uploadDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadDocument.fulfilled, (state, action) => {
                state.loading = false;
                // Add new document to list
                if (action.payload.data && action.payload.data.document) {
                    state.documents.unshift(action.payload.data.document);
                }
            })
            .addCase(uploadDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Document
            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.documents = state.documents.filter(doc => doc._id !== action.payload);
            });
    }
});

export const { clearDocumentError, resetUploadProgress } = documentSlice.actions;
export default documentSlice.reducer;
