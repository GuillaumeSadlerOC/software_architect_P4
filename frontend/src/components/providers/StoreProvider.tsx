'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store/store';
import { initializeAuth } from '@/lib/store/features/auth/authSlice';

/**
 * Provider Redux
 * Manages the initial state hydration synchronously to avoid 401 errors at startup.
 */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(undefined);

  if (!storeRef.current) {
    // Creating the store instance
    storeRef.current = makeStore();
    
    // Synchronous Hydration
    storeRef.current.dispatch(initializeAuth());
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}