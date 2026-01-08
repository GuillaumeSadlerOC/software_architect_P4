import { apiSlice } from '@/lib/store/api/apiSlice';
import type {
  SharedFile,
  CreateFileResponse,
  FileMetadata,
  DownloadFormData,
  FileFilters,
  FileTag,
  CreateFileRequest
} from '@/types/file';

export const filesApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    
    // US01: Upload authenticated
    // Note: We use FormData directly because it's multipart/form-data.
    uploadFile: builder.mutation<CreateFileResponse, FormData>({
      query: (formData) => ({
        url: '/files/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['File'],
    }),

    // US07: Anonymous upload
    uploadFileAnonymous: builder.mutation<CreateFileResponse, FormData>({
      query: (formData) => ({
        url: '/files/upload-anonymous',
        method: 'POST',
        body: formData,
      }),
    }),

    // US02: Public Metadata
    getFileInfo: builder.query<FileMetadata, string>({
      query: (token) => `/files/${token}/metadata`,
      keepUnusedDataFor: 60, 
    }),

    // US02/US09: Download
    downloadFile: builder.mutation<Blob, DownloadFormData>({
      query: ({ token, password }) => ({
        url: `/files/${token}/download`,
        method: 'POST',
        body: { password },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // US05: History with filters (US08: tag filter)
    getMyFiles: builder.query<SharedFile[], Partial<FileFilters>>({
      query: (filters) => ({
        url: '/files/history',
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'File' as const, id })),
              { type: 'File', id: 'LIST' },
            ]
          : [{ type: 'File', id: 'LIST' }],
    }),

    // US06: Deletion
    deleteFile: builder.mutation<void, string>({
      query: (id) => ({
        url: `/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'File', id: 'LIST' }],
    }),

    // US08: Tag update
    updateFileTags: builder.mutation<SharedFile, { id: string; tags: string[] }>({
      query: ({ id, tags }) => ({
        url: `/files/${id}/tags`,
        method: 'PATCH',
        body: { tags },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'File', id }, 'Tag'],
    }),

    // US09: Password update (post-upload)
    updateFilePassword: builder.mutation<SharedFile, { id: string; password: string }>({
      query: ({ id, password }) => ({
        url: `/files/${id}/password`,
        method: 'PATCH',
        body: { password },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'File', id }],
    }),

    // US10: Expiration Update
    updateFileExpiration: builder.mutation<SharedFile, { id: string; expirationDays: number }>({
      query: ({ id, expirationDays }) => ({
        url: `/files/${id}/expiration`,
        method: 'PATCH',
        body: { expirationDays },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'File', id }],
    }),
  }),
});

// Exports of automatically generated hooks
export const {
  useUploadFileMutation,
  useUploadFileAnonymousMutation,
  useGetFileInfoQuery,
  useDownloadFileMutation,
  useGetMyFilesQuery,
  useDeleteFileMutation,
  useUpdateFileTagsMutation,
  useUpdateFilePasswordMutation,
  useUpdateFileExpirationMutation,
} = filesApi;