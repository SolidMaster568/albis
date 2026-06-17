import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Event } from '../../types/domain';
import type { EventFormValues } from '../../types/forms';

type CalendarState = {
  events: Event[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  saving: boolean;
  error: string | null;
};

const initialState: CalendarState = {
  events: [],
  status: 'idle',
  saving: false,
  error: null
};

export const fetchEvents = createAsyncThunk('calendar/fetchEvents', async () => api.getEvents());
export const createEvent = createAsyncThunk('calendar/createEvent', async (payload: EventFormValues) =>
  api.createEvent(payload)
);
export const updateEvent = createAsyncThunk(
  'calendar/updateEvent',
  async ({ id, values }: { id: string; values: EventFormValues }) => api.updateEvent(id, values)
);
export const deleteEvent = createAsyncThunk('calendar/deleteEvent', async (id: string) => {
  await api.deleteEvent(id);
  return id;
});

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load events';
      })
      .addCase(createEvent.pending, (state) => {
        state.saving = true;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.saving = false;
        state.events.push(action.payload);
        state.events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? 'Unable to create event';
      })
      .addCase(updateEvent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.saving = false;
        state.events = state.events.map((event) =>
          event._id === action.payload._id ? action.payload : event
        );
        state.events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? 'Unable to update event';
      })
      .addCase(deleteEvent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.saving = false;
        state.events = state.events.filter((event) => event._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? 'Unable to delete event';
      });
  }
});

export default calendarSlice.reducer;
