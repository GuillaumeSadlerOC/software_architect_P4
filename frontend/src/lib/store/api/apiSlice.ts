import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { RootState } from '../store'; 
import { logOut } from '../features/auth/authSlice';
import { env } from '@/config/env';

const mutex = new Mutex();

const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    return env.INTERNAL_API_URL; 
  }
  return env.NEXT_PUBLIC_API_URL;
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.accessToken; 
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn('Unauthorized - Logging out');
    api.dispatch(logOut()); 
    if (typeof window !== 'undefined') {
       window.location.href = '/login';
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['File', 'User', 'Tag'],
  endpoints: () => ({}),
});