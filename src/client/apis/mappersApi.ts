import { createApi } from '@reduxjs/toolkit/query/react';
import customFetchBase from 'src/client/apis/apiMiddleware';

export interface MapperPreviewRequest {
  scribanTemplate: string;
  inputJson: string;
}

export interface MapperPreviewResponse {
  outputJson: string | null;
  error: string | null;
}

export const MappersApi = createApi({
  baseQuery: customFetchBase,
  reducerPath: 'MappersApi',
  endpoints: (builder) => ({
    previewMapping: builder.mutation<MapperPreviewResponse, MapperPreviewRequest>({
      query: (body) => ({
        url: 'Mappers',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { usePreviewMappingMutation } = MappersApi;
