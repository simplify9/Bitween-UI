import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {NotifierModel, NotifiersSearchModel} from "src/types/notifiers";
import {ApiResponse} from "src/types/common";

export const NotifiersApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "NotifiersApi",
    tagTypes: ["notifiers"],
    endpoints: (builder) => ({
        notifiers: builder.query<ApiResponse<NotifierModel>, NotifiersSearchModel>({
            providesTags: ['notifiers'],
            query: () => ({
                url: 'notifiers',
                method: "GET",

            })
        })
    })
});


export const {
    useNotifiersQuery,

} = NotifiersApi