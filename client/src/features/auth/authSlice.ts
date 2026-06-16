import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api, tokenStorage } from '../../services/api';
import type { AuthResponse, Family, User } from '../../types/domain';
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  ProfileFormValues,
  RegisterFormValues
} from '../../types/forms';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type AuthState = {
  user: User | null;
  family: Family | null;
  token: string | null;
  status: RequestStatus;
  profileStatus: RequestStatus;
  error: string | null;
  resetMessage: string | null;
};

const initialState: AuthState = {
  user: null,
  family: null,
  token: tokenStorage.get(),
  status: 'idle',
  profileStatus: 'idle',
  error: null,
  resetMessage: null
};

export const login = createAsyncThunk('auth/login', async (payload: LoginFormValues) => {
  return api.login(payload);
});

export const register = createAsyncThunk('auth/register', async (payload: RegisterFormValues) => {
  return api.register(payload);
});

export const fetchProfile = createAsyncThunk('auth/profile', async () => {
  return api.getProfile();
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload: ProfileFormValues) => {
    return api.updateProfile(payload);
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordFormValues) => {
    return api.forgotPassword(payload);
  }
);

const setAuthenticated = (state: AuthState, payload: AuthResponse) => {
  state.user = payload.user;
  state.family = payload.family;
  state.token = payload.token;
  state.status = 'succeeded';
  state.error = null;
  tokenStorage.set(payload.token);
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.family = null;
      state.token = null;
      state.status = 'idle';
      state.profileStatus = 'idle';
      state.error = null;
      tokenStorage.clear();
    },
    setFamily(state, action: PayloadAction<Family>) {
      state.family = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        setAuthenticated(state, action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to sign in';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        setAuthenticated(state, action.payload);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to create account';
      })
      .addCase(fetchProfile.pending, (state) => {
        state.profileStatus = 'loading';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.family = action.payload.family;
        state.profileStatus = 'succeeded';
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.profileStatus = 'failed';
        state.token = null;
        tokenStorage.clear();
      })
      .addCase(updateProfile.pending, (state) => {
        state.profileStatus = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.profileStatus = 'succeeded';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.error = action.error.message ?? 'Unable to update profile';
      })
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.resetMessage = null;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.resetMessage = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to process reset request';
      });
  }
});

export const { logout, setFamily } = authSlice.actions;
export default authSlice.reducer;
