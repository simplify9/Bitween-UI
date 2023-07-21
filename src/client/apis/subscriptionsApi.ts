import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {ISubscription} from "src/types/subscriptions";
import {ApiPagedResponse} from "src/types/common";

export const SubscriptionApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "SubscriptionApi",
    tagTypes: ["subscription"],
    endpoints: (builder) => ({
        subscriptions: builder.query<ApiPagedResponse<ISubscription>, {
            offset: number,
            limit: number
        }>({
            providesTags: ['subscription'],
            query: params => ({
                url: 'subscriptions',
                method: "GET",
                params
            })
        }),
        subscriptionsLookup: builder.query<Record<string, string>, void>({
            providesTags: ['subscription'],
            query: () => ({
                url: 'subscriptions',
                method: "GET",
                params:{lookup:true}
            })
        })
    })
});


export const {
    useSubscriptionsQuery,
    useSubscriptionsLookupQuery
} = SubscriptionApi