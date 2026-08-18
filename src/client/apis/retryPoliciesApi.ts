import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {
    RetryPoliciesSearchModel,
    RetryPolicyModel,
    RetryPolicyRow,
    RetryGroupUsageRow,
    RetryGroupAttempts,
    RetryGroupAttemptsRequest,
    RetryPolicyResetUsage,
    TestRetryPolicyRequest,
    TestRetryPolicyResponse,
    RetryAlertOverrideSave
} from "src/types/retryPolicies";
import {ApiPagedResponse} from "src/types/common";

export const RetryPoliciesApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "RetryPoliciesApi",
    tagTypes: ["retryPolicies", "retryPolicyUsage"],
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
            // Saving drops the counters of any removed group and can change a group's own alert,
            // which is where inheriting rows resolve to, so the subscriptions panel must refetch.
            invalidatesTags: ['retryPolicies', 'retryPolicyUsage'],
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
        }),
        retryPolicyUsage: builder.query<RetryGroupUsageRow[], number>({
            providesTags: ['retryPolicyUsage'],
            query: id => ({
                url: `RetryPolicies/${id}/usage`,
                method: "POST",
                body: {}
            })
        }),
        // Cached per pair and left alone by resets and override saves: neither changes which
        // failures happened. Only a retry actually running would, and polling every open row for
        // that costs more than it tells anyone.
        retryPolicyAttempts: builder.query<RetryGroupAttempts, { id: number } & RetryGroupAttemptsRequest>({
            query: ({id, ...body}) => ({
                url: `RetryPolicies/${id}/attempts`,
                method: "POST",
                body
            })
        }),
        resetRetryPolicyUsage: builder.mutation<{}, { id: number } & RetryPolicyResetUsage>({
            invalidatesTags: ['retryPolicyUsage'],
            query: ({id, ...body}) => ({
                url: `RetryPolicies/${id}/resetusage`,
                method: "POST",
                body
            })
        }),
        saveRetryAlertOverride: builder.mutation<{}, { id: number } & RetryAlertOverrideSave>({
            // Saving an override changes where other rows resolve to as well, so refetch the lot.
            invalidatesTags: ['retryPolicyUsage'],
            query: ({id, ...body}) => ({
                url: `RetryPolicies/${id}/savealertoverride`,
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
    useRetryPolicyUsageQuery,
    useRetryPolicyAttemptsQuery,
    useResetRetryPolicyUsageMutation,
    useSaveRetryAlertOverrideMutation,
} = RetryPoliciesApi;
