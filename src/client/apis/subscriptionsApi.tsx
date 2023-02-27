import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {AdapterFindQuery, ISubscription} from "src/types/subscriptions";
import {ApiPagedResponse} from "src/types/common";

export const SubscriptionApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "SubscriptionApi",
    tagTypes: ["subscription", "adapters"],
    endpoints: (builder) => ({
        adaptersLookup: builder.query<Record<string, string>, AdapterFindQuery>({
            providesTags: ['adapters'],
            keepUnusedDataFor: 10,
            query: () => ({
                url: 'Adapters',
                method: "GET",
            })
        }),
        subscriptions: builder.query<ApiPagedResponse<ISubscription>, {}>({
            providesTags: ['subscription'],
            query: params => ({
                url: 'subscriptions',
                method: "GET",
                params
            })
        })
    })
});


export const {
    useSubscriptionsQuery,
    useAdaptersLookupQuery
} = SubscriptionApi