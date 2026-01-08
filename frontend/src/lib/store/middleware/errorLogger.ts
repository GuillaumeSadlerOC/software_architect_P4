import { isRejectedWithValue, isFulfilled } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import { toast } from 'sonner';

// Configuration
const MAX_CONSECUTIVE_ERRORS = 3;
const ERROR_PAGE_PATH = '/server-error';

// Local state (RAM)
let consecutive500Errors = 0;

/**
 * RTK Query middleware for error logging + Circuit Breaker
 * - Toast on errors 400/404/500
 * - Count the 500 consecutive ones (NestJS crash)
 * - After 3 500 errors, redirect to /server-error
 * - Reset counter on success or errors not 500
 */
export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  // Success → reset counter
  if (isFulfilled(action)) {
    consecutive500Errors = 0;
    return next(action);
  }

  // Error
  if (isRejectedWithValue(action)) {
    const payload = action.payload as any;
    const status = payload?.status; // NestJS always returns status

    // 500 error handling (NestJS backend crash) or FETCH_ERROR (network)
    if (status === 500 || status === 'FETCH_ERROR') {
      consecutive500Errors++;
      console.warn(`[Circuit Breaker] Erreur critique ${consecutive500Errors}/${MAX_CONSECUTIVE_ERRORS}`);

      if (consecutive500Errors >= MAX_CONSECUTIVE_ERRORS) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('server-error')) {
          window.location.href = ERROR_PAGE_PATH;
        }
      } else {
        toast.error('Problème serveur', {
          description: `Attempting to reconnect... (${consecutive500Errors}/${MAX_CONSECUTIVE_ERRORS})`,
          duration: 4000,
        });
      }
    } 
    // Errors 400/404 (business errors, not crashes) → counter reset
    else if (status !== 401 && status !== 403) {
      consecutive500Errors = 0;
      toast.error('Erreur', {
        description: payload?.data?.message || 'Action impossible',
        duration: 5000,
      });
    }
  }

  return next(action);
};