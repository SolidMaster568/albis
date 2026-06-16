import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Family, FamilyRole } from '../../types/domain';
import type { InviteFormValues } from '../../types/forms';

type FamilyState = {
  family: Family | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  saving: boolean;
  error: string | null;
};

const initialState: FamilyState = {
  family: null,
  status: 'idle',
  saving: false,
  error: null
};

export const fetchCurrentFamily = createAsyncThunk('family/fetchCurrent', async () =>
  api.getFamily()
);
export const inviteMember = createAsyncThunk('family/invite', async (payload: InviteFormValues) =>
  api.inviteMember(payload)
);
export const updateMemberRole = createAsyncThunk(
  'family/updateRole',
  async ({ userId, role }: { userId: string; role: FamilyRole }) => api.updateMemberRole(userId, role)
);

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentFamily.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentFamily.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.family = action.payload;
      })
      .addCase(fetchCurrentFamily.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load family';
      })
      .addCase(inviteMember.pending, (state) => {
        state.saving = true;
      })
      .addCase(inviteMember.fulfilled, (state, action) => {
        state.saving = false;
        state.family = action.payload.family;
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? 'Unable to invite member';
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        state.family = action.payload;
      });
  }
});

export default familySlice.reducer;
