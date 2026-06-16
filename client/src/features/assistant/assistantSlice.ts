import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { AssistantMessage } from '../../types/domain';

type AssistantState = {
  messages: AssistantMessage[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: AssistantState = {
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'I can pull together tasks, events and reminders into a family operations brief.'
    }
  ],
  status: 'idle',
  error: null
};

export const sendPrompt = createAsyncThunk('assistant/sendPrompt', async (prompt: string) => {
  const result = await api.chat(prompt);
  return result;
});

const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    addUserMessage(state, action: { payload: string }) {
      state.messages.push({
        id: crypto.randomUUID(),
        role: 'user',
        content: action.payload
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendPrompt.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sendPrompt.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages.push({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: action.payload.response
        });
      })
      .addCase(sendPrompt.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to reach assistant';
      });
  }
});

export const { addUserMessage } = assistantSlice.actions;
export default assistantSlice.reducer;
