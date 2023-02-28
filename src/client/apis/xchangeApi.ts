import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {ExchangeFindQuery, IXchange} from "src/types/xchange";
import {formulateQueryString} from "src/client";
import {ApiPagedResponse} from "src/types/common";

export const XchangeApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "XchangeApi",
    tagTypes: ["xchanges"],
    endpoints: (builder) => ({
        xChanges: builder.query<ApiPagedResponse<IXchange>, ExchangeFindQuery>({
            providesTags: ['xchanges'],
            query: params => ({
                url: `xchanges${formulateQueryString(params)}`,
                method: "GET",
            })
        }),

    })
});


export const {
    useXChangesQuery,
    useLazyXChangesQuery
} = XchangeApi