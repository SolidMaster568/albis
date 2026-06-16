import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Notification } from '../../types/domain';

type NotificationsState = {
  items: Notification[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: NotificationsState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () =>
  api.getNotifications()
);
export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string) => api.markNotificationRead(id)
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load notifications';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      });
  }
});

export default notificationsSlice.reducer;
