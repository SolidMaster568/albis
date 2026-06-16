import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { DashboardSummary } from '../../types/domain';

type DashboardState = {
  summary: DashboardSummary | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: DashboardState = {
  summary: null,
  status: 'idle',
  error: null
};

export const fetchDashboardSummary = createAsyncThunk('dashboard/fetchSummary', async () => {
  return api.getDashboardSummary();
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load dashboard';
      });
  }
});

export default dashboardSlice.reducer;
