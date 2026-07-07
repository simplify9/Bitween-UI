import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {DelayedRetriesSearchModel, DelayedRetryRow} from "src/types/delayedRetries";
import {ApiPagedResponse} from "src/types/common";
import {formulateQueryString} from "src/client";

export const DelayedRetriesApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "DelayedRetriesApi",
    tagTypes: ["delayedRetries"],
    endpoints: (builder) => ({
        delayedRetries: builder.query<ApiPagedResponse<DelayedRetryRow>, DelayedRetriesSearchModel>({
            providesTags: ['delayedRetries'],
            query: (params) => ({
                url: `DelayedRetries${formulateQueryString(params)}`,
                method: "GET",
            })
        }),
        runDelayedRetryNow: builder.mutation<{}, string>({
            invalidatesTags: ['delayedRetries'],
            query: id => ({
                url: `DelayedRetries/${id}/runnow`,
                method: "POST",
                body: {}
            })
        }),
    })
});

export const {
    useDelayedRetriesQuery,
    useLazyDelayedRetriesQuery,
    useRunDelayedRetryNowMutation,
} = DelayedRetriesApi;
