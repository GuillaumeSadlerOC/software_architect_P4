import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Reducers
import { apiSlice } from './api/apiSlice';
import uiReducer from './features/ui/uiSlice';
import authReducer from './features/auth/authSlice';
import filesReducer from './features/files/filesSlice';

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      ui: uiReducer,
      auth: authReducer,
      files: filesReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      })
        .concat(apiSlice.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  setupListeners(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];