import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Reminder } from '../../types/domain';

type RemindersState = {
  items: Reminder[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: RemindersState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchReminders = createAsyncThunk('reminders/fetch', async () => api.getReminders());

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load reminders';
      });
  }
});

export default remindersSlice.reducer;
