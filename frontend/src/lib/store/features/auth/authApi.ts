import { apiSlice } from '@/lib/store/api/apiSlice';
import { setCredentials } from './authSlice';
import type { User } from '@/types/user';
import type { LoginResponse, CreateUserRequest, LoginRequest } from '@/types/user';

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    
    // US03: Registration
    register: builder.mutation<User, CreateUserRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // US04: Login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const response = data as unknown as { token: string; user: User };
          
          if (response.token) {
            dispatch(setCredentials({ 
              user: response.user, 
              accessToken: response.token,
            }));
          } else {
            console.error("❌ ERREUR AUTH: Token manquant dans la réponse backend", data);
          }

        } catch (err) {
          // The error will be handled by the UI component via { isError }
        }
      },
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation,
} = authApi;