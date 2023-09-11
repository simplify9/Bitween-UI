import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {
    CreateSubscriptionCategoryModel,
    DeleteSubscriptionCategoryModel,
    ISubscription,
    SearchSubscriptionCategoryModel,
    SubscriptionCategoryModel,
    UpdateSubscriptionCategoryModel
} from "src/types/subscriptions";
import {ApiPagedResponse} from "src/types/common";

export const SubscriptionApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "SubscriptionApi",
    tagTypes: ["subscription", "subscriptionCategories"],
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
        subscriptionCategories: builder.query<ApiPagedResponse<SubscriptionCategoryModel>, SearchSubscriptionCategoryModel>({
            providesTags: ['subscriptionCategories'],
            query: params => ({
                url: 'subscriptionCategories',
                method: "GET",
                params
            })
        }),
        createSubscriptionCategory: builder.mutation<{ id: number }, CreateSubscriptionCategoryModel>({
            invalidatesTags: ['subscriptionCategories'],
            query: body => ({
                url: 'subscriptionCategories',
                method: "POST",
                body
            })
        }),
        updateSubscriptionCategory: builder.mutation<{ id: number }, UpdateSubscriptionCategoryModel>({
            invalidatesTags: ['subscriptionCategories', 'subscription'],
            query: body => ({
                url: `subscriptionCategories/${body.id}`,
                method: "POST",
                body
            })
        }),
        deleteSubscriptionCategory: builder.mutation<{ id: number }, DeleteSubscriptionCategoryModel>({
            invalidatesTags: ['subscriptionCategories'],
            query: body => ({
                url: `subscriptionCategories/${body.id}/delete`,
                method: "POST",
                body
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
    useSubscriptionsLookupQuery,
    useCreateSubscriptionCategoryMutation,
    useUpdateSubscriptionCategoryMutation,
    useSubscriptionCategoriesQuery,
    useDeleteSubscriptionCategoryMutation,
    useSubscriptionsQuery,
} = SubscriptionApi