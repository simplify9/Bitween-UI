import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {NotificationModel, NotifierModel, NotifiersSearchModel} from "src/types/notifiers";
import {ApiPagedResponse, BaseSearchModel} from "src/types/common";
import {formulateQueryString} from "src/client";

export const NotifiersApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "NotifiersApi",
    tagTypes: ["notifiers"],
    endpoints: (builder) => ({
        notifications: builder.query<ApiPagedResponse<NotificationModel>, BaseSearchModel>({
            query: params => ({
                url: `Notifications${formulateQueryString(params)}`,
                method: "GET",
            })
        }),
        notifiers: builder.query<ApiPagedResponse<NotifierModel>, NotifiersSearchModel>({
            providesTags: ['notifiers'],
            query: () => ({
                url: 'notifiers',
                method: "GET",

            })
        }),
        notifier: builder.query<NotifierModel, string>({
            providesTags: ['notifiers'],
            query: id => ({
                url: `notifiers/${id}`,
                method: "GET",

            })
        }),
        updateNotifier: builder.mutation<{}, NotifierModel>({
            invalidatesTags: ['notifiers'],
            query: body => ({
                url: `notifiers/${body.id}`,
                method: "POST",
                body

            })
        }),
        createNotifier: builder.mutation<{ id: string }, { name: string }>({
            invalidatesTags: ['notifiers'],
            transformResponse: (returnValue: string) => {
                return {id: returnValue}
            },
            query: body => ({
                url: 'notifiers',
                method: "POST",
                body

            })
        })
    })
});


export const {
    useNotificationsQuery,
    useUpdateNotifierMutation,
    useLazyNotifierQuery,
    useNotifiersQuery,
    useCreateNotifierMutation,
} = NotifiersApi