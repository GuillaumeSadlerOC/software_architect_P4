import { apiSlice } from '@/lib/store/api/apiSlice';
import type { FileTag } from '@/types/file';

export const tagsApi = apiSlice.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // US08: Retrieve all user tags (with counters)
    getMyTags: builder.query<FileTag[], void>({
      query: () => '/files/tags', 
      providesTags: ['Tag'],
    }),
  }),
});

export const {
  useGetMyTagsQuery,
} = tagsApi;