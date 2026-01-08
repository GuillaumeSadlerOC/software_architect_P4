import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FileFilters } from '@/types/file';

/**
 * This slice manages the UI state for the files section.
 */

interface FilesUiState {
  viewMode: 'list' | 'grid';
  filters: FileFilters;
  isUploadSheetOpen: boolean;
}

const initialState: FilesUiState = {
  viewMode: 'list',
  filters: {
    search: '',
    tag: undefined,
  },
  isUploadSheetOpen: false,
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    // Change the view (List or Grid)
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === 'list' ? 'grid' : 'list';
    },
    
    // Updates search filters
    setFilters: (state, action: PayloadAction<Partial<FileFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset the filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Upload drawer management (useful for opening it from the header)
    setUploadSheetOpen: (state, action: PayloadAction<boolean>) => {
      state.isUploadSheetOpen = action.payload;
    },
  },
});

export const { 
  toggleViewMode, 
  setFilters, 
  resetFilters, 
  setUploadSheetOpen 
} = filesSlice.actions;

export default filesSlice.reducer;

// Selectors
export const selectViewMode = (state: { files: FilesUiState }) => state.files.viewMode;
export const selectFileFilters = (state: { files: FilesUiState }) => state.files.filters;
export const selectIsUploadSheetOpen = (state: { files: FilesUiState }) => state.files.isUploadSheetOpen;