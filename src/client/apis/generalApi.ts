import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {AdapterFindQuery} from "src/types/subscriptions";
import {AccountModel} from "src/types/accounts";

export const GeneralApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "GeneralApi",
    tagTypes: ["account", "adapters"],
    endpoints: (builder) => ({
        adaptersLookup: builder.query<Record<string, string>, AdapterFindQuery>({
            providesTags: ['adapters'],
            keepUnusedDataFor: 1,
            query: () => ({
                url: 'Adapters',
                method: "GET",
            })
        }),
        profile: builder.query<AccountModel, void>({
            providesTags: ['account'],
            query: () => ({
                url: 'accounts/profile',
                method: "GET",
            })
        }),
    })
});


export const {
    useAdaptersLookupQuery,
    useProfileQuery,
} = GeneralApi