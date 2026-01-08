'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated, selectCurrentUser } from '@/lib/store/features/auth/authSlice';
import { useGetMeQuery } from '@/lib/store/features/user/userApi';
import PublicHeader from './PublicHeader';

/**
 * Smart wrapper for the public header.
 * It detects the connection status via Redux and transmits it to the visual component.
 */
export default function PublicHeaderWrapper() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  // State to determine if we are on the client side (browser)
  const [isMounted, setIsMounted] = useState(false);

  // useEffect only runs on the client side after the first render
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // User information is discreetly refreshed if you are logged in.
  useGetMeQuery(undefined, { skip: !isAuthenticated });

  const showAuthenticated = isMounted && isAuthenticated;

  // We'll pass these props to the PublicHeader
  return (
    <PublicHeader 
      isAuthenticated={showAuthenticated} 
      user={showAuthenticated ? user : null}
    />
  );
}