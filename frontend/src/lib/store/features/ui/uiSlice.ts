import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isMobileMenuOpen: boolean;
  theme: 'light' | 'dark' | 'system';
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  theme: 'system',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
  },
});

export const { toggleMobileMenu, setMobileMenuOpen, setTheme } = uiSlice.actions;
export default uiSlice.reducer;