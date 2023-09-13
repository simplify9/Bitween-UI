import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {
    CreateSubscriptionCategoryModel,
    DeleteSubscriptionCategoryModel,
    ICreateSubscription,
    ISubscription,
    SearchSubscriptionCategoryModel,
    SubscriptionCategoryModel,
    UpdateSubscriptionCategoryModel
} from "src/types/subscriptions";
import {ApiPagedResponse} from "src/types/common";
import {formulateQueryString} from "src/client";

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
                url: `subscriptions${formulateQueryString(params)}`,
                method: "GET",
            })
        }),
        subscription: builder.query<ISubscription, number>({
            providesTags: ['subscription'],
            query: id => ({
                url: `subscriptions/${id}`,
                method: "GET",
            })
        }),
        createSubscription: builder.mutation<number, ICreateSubscription>({
            invalidatesTags: ['subscription'],
            query: body => ({
                url: 'subscriptions',
                method: "POST",
                body
            })
        }),
        deleteSubscription: builder.mutation<{ id: number }, number>({
            invalidatesTags: ['subscription'],
            query: id => ({
                url: `subscriptions/${id}`,
                method: "DELETE",
            })
        }),
        updateSubscription: builder.mutation<{ id: number }, ISubscription>({
            invalidatesTags: ['subscription'],
            query: body => ({
                url: `subscriptions/${body.id}`,
                method: "POST",
                body
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
                params: {lookup: true}
            })
        })
    })
});


export const {
    useUpdateSubscriptionMutation,
    useLazySubscriptionQuery,
    useCreateSubscriptionMutation,
    useSubscriptionsLookupQuery,
    useCreateSubscriptionCategoryMutation,
    useUpdateSubscriptionCategoryMutation,
    useSubscriptionCategoriesQuery,
    useDeleteSubscriptionCategoryMutation,
    useSubscriptionsQuery,
    useLazySubscriptionsQuery,
} = SubscriptionApi