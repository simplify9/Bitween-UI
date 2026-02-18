import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {
    GlobalAdapterValuesSetModel,
    GlobalAdapterValuesSetCreate,
    GlobalAdapterValuesSetUpdate,
    GlobalAdapterValuesSetsSearchModel
} from "src/types/globalAdapterValuesSets";
import {ApiPagedResponse} from "src/types/common";

export const GlobalAdapterValuesSetsApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "GlobalAdapterValuesSetsApi",
    tagTypes: ["globalAdapterValuesSets"],
    endpoints: (builder) => ({
        globalAdapterValuesSets: builder.query<ApiPagedResponse<GlobalAdapterValuesSetModel>, GlobalAdapterValuesSetsSearchModel>({
            providesTags: ['globalAdapterValuesSets'],
            query: () => ({
                url: 'GlobalAdapterValuesSets',
                method: "GET",
            })
        }),
        globalAdapterValuesSet: builder.query<GlobalAdapterValuesSetModel, string>({
            providesTags: ['globalAdapterValuesSets'],
            query: id => ({
                url: `GlobalAdapterValuesSets/${id}`,
                method: "GET",
            })
        }),
        updateGlobalAdapterValuesSet: builder.mutation<{}, { id: string } & GlobalAdapterValuesSetUpdate>({
            invalidatesTags: ['globalAdapterValuesSets'],
            query: body => ({
                url: `GlobalAdapterValuesSets/${body.id}`,
                method: "POST",
                body
            })
        }),
        createGlobalAdapterValuesSet: builder.mutation<{ id: string }, GlobalAdapterValuesSetCreate>({
            invalidatesTags: ['globalAdapterValuesSets'],
            transformResponse: (returnValue: string) => {
                return {id: returnValue}
            },
            query: body => ({
                url: 'GlobalAdapterValuesSets',
                method: "POST",
                body
            })
        }),
        deleteGlobalAdapterValuesSet: builder.mutation<{}, string>({
            invalidatesTags: ['globalAdapterValuesSets'],
            query: id => ({
                url: `GlobalAdapterValuesSets/${id}/delete`,
                method: "POST",
                body: {}
            })
        })
    })
});

export const {
    useGlobalAdapterValuesSetsQuery,
    useLazyGlobalAdapterValuesSetQuery,
    useUpdateGlobalAdapterValuesSetMutation,
    useCreateGlobalAdapterValuesSetMutation,
    useDeleteGlobalAdapterValuesSetMutation,
} = GlobalAdapterValuesSetsApi;
