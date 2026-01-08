import { apiSlice } from '@/lib/store/api/apiSlice';
import { updateUser } from '../auth/authSlice';
import type { User } from '@/types/user';

export const userApi = apiSlice.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Retrieve the current user
    // Backend route: GET /api/users/me
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    // Update the current user
    // Backend route: PATCH /api/users/me
    updateMe: builder.mutation<User, Partial<User>>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUser(data));
        } catch (err) {
          // The error will be handled by the UI component via { isError }
        }
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const { 
  useGetMeQuery,
  useUpdateMeMutation,
} = userApi;