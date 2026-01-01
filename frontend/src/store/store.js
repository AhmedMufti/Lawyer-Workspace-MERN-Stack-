import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import caseReducer from './slices/caseSlice';
import documentReducer from './slices/documentSlice';
import dashboardReducer from './slices/dashboardSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        cases: caseReducer,
        documents: documentReducer,
        dashboard: dashboardReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export default store;
