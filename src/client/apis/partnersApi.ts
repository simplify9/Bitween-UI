import { createApi } from '@reduxjs/toolkit/query/react';
import customFetchBase from 'src/client/apis/apiMiddleware';

export interface PartnerListItem {
  id: number;
  name: string;
}

export interface PartnerDetail {
  id?: number;
  name: string;
  adapterProperties?: Record<string, string>;
}

export const PartnersApi = createApi({
  baseQuery: customFetchBase,
  reducerPath: 'PartnersApi',
  tagTypes: ['partners'],
  endpoints: (builder) => ({
    partners: builder.query<PartnerListItem[], void>({
      providesTags: ['partners'],
      query: () => ({ url: 'partners', method: 'GET' }),
      transformResponse: (raw: any) => {
        const arr = raw?.result ?? raw ?? [];
        return (arr as any[]).map((p: any) => ({ id: Number(p.id), name: p.name }));
      },
    }),
    partner: builder.query<PartnerDetail, number>({
      providesTags: ['partners'],
      query: (id) => ({ url: `partners/${id}`, method: 'GET' }),
      transformResponse: (raw: any) => {
        // Handle both direct response and wrapped { result: ... }
        const data = raw?.result ?? raw;
        const props = data?.adapterProperties ?? data?.AdapterProperties ?? undefined;
        return {
          id: data?.id ?? data?.Id,
          name: data?.name ?? data?.Name ?? '',
          adapterProperties: props ?? undefined,
        };
      },
    }),
  }),
});

export const { usePartnersQuery, usePartnerQuery } = PartnersApi;
