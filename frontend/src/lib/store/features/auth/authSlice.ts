import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user';
import { RootState } from '@/lib/store/store';

interface AuthState {
  user: User | null;         
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action called after a successful login/register
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      
      // Basic persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
    },

    // Partial update
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },

    // Hydration when the app loads (F5)
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          try {
            state.accessToken = token;
            state.user = JSON.parse(userStr);
            state.isAuthenticated = true;
          } catch (e) {
            console.error("Auth: Failed to parse user from storage");
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
          }
        }
      }
      state.isInitialized = true;
    },

    // Logout
    logOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    },
  },
});

export const { setCredentials, updateUser, initializeAuth, logOut } = authSlice.actions;
export default authSlice.reducer;

// Typed selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthInitialized = (state: RootState) => state.auth.isInitialized;