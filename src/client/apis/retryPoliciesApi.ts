import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {
    RetryPoliciesSearchModel,
    RetryPolicyModel,
    RetryPolicyRow,
    TestRetryPolicyRequest,
    TestRetryPolicyResponse
} from "src/types/retryPolicies";
import {ApiPagedResponse} from "src/types/common";

export const RetryPoliciesApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "RetryPoliciesApi",
    tagTypes: ["retryPolicies"],
    endpoints: (builder) => ({
        retryPolicies: builder.query<ApiPagedResponse<RetryPolicyRow>, RetryPoliciesSearchModel>({
            providesTags: ['retryPolicies'],
            query: () => ({
                url: 'RetryPolicies',
                method: "GET",
            })
        }),
        retryPolicy: builder.query<RetryPolicyModel, number>({
            providesTags: ['retryPolicies'],
            query: id => ({
                url: `RetryPolicies/${id}`,
                method: "GET",
            })
        }),
        createRetryPolicy: builder.mutation<{ id: number }, RetryPolicyModel>({
            invalidatesTags: ['retryPolicies'],
            transformResponse: (returnValue: number) => {
                return {id: returnValue}
            },
            query: body => ({
                url: 'RetryPolicies',
                method: "POST",
                body
            })
        }),
        updateRetryPolicy: builder.mutation<{}, { id: number } & RetryPolicyModel>({
            invalidatesTags: ['retryPolicies'],
            query: body => ({
                url: `RetryPolicies/${body.id}`,
                method: "POST",
                body
            })
        }),
        deleteRetryPolicy: builder.mutation<{}, number>({
            invalidatesTags: ['retryPolicies'],
            query: id => ({
                url: `RetryPolicies/${id}`,
                method: "DELETE",
            })
        }),
        retryPoliciesLookup: builder.query<Record<string, string>, void>({
            providesTags: ['retryPolicies'],
            query: () => ({
                url: 'RetryPolicies',
                method: "GET",
                params: {lookup: true}
            })
        }),
        testRetryPolicy: builder.mutation<TestRetryPolicyResponse, TestRetryPolicyRequest>({
            query: body => ({
                url: 'RetryPolicies/test',
                method: "POST",
                body
            })
        })
    })
});

export const {
    useRetryPoliciesQuery,
    useRetryPolicyQuery,
    useLazyRetryPolicyQuery,
    useCreateRetryPolicyMutation,
    useUpdateRetryPolicyMutation,
    useDeleteRetryPolicyMutation,
    useRetryPoliciesLookupQuery,
    useTestRetryPolicyMutation,
} = RetryPoliciesApi;
