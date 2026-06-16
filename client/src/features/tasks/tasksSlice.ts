import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Task } from '../../types/domain';
import type { TaskFormValues } from '../../types/forms';

type TasksState = {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  saving: boolean;
  error: string | null;
};

const initialState: TasksState = {
  items: [],
  status: 'idle',
  saving: false,
  error: null
};

export const fetchTasks = createAsyncThunk('tasks/fetch', async () => api.getTasks());
export const createTask = createAsyncThunk('tasks/create', async (payload: TaskFormValues) =>
  api.createTask(payload)
);
export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, values }: { id: string; values: Partial<TaskFormValues> }) =>
    api.updateTask(id, values)
);
export const deleteTask = createAsyncThunk('tasks/delete', async (id: string) => {
  await api.deleteTask(id);
  return id;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load tasks';
      })
      .addCase(createTask.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? 'Unable to create task';
      })
      .addCase(updateTask.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((task) =>
          task._id === action.payload._id ? action.payload : task
        );
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? 'Unable to update task';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task._id !== action.payload);
      });
  }
});

export default tasksSlice.reducer;
