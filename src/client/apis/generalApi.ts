import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {AdapterFindQuery} from "src/types/subscriptions";
import {AccountModel, ChangePasswordModel, CreateAccountModel, EditModal} from "src/types/accounts";
import {formulateQueryString} from "src/client";
import {ApiPagedResponse} from "src/types/common";
import {ChartPointsResponse, MainInfoResponse, XchangeMainInfo} from "src/types/dashboard";
import {Config} from "src/types/config";

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
        adapterMetadata: builder.query<{ timestamp?: string }, string>({
            query: (m) => ({
                url: `Adapters/${m}/metadata`,
                method: "GET",
            })
        }),
        profile: builder.query<AccountModel, void>({
            //providesTags: ['account'],
            query: () => ({
                url: 'accounts/profile',
                method: "GET",
            })
        }),
        removeMember: builder.mutation<{}, { id: number }>({
            invalidatesTags: ['account'],
            query: (body) => ({
                url: `Accounts/${body.id}/remove`,
                method: 'POST',
                body: body
            })
        }),
        findMembers: builder.query<ApiPagedResponse<AccountModel>, {
            lookup?: boolean,
            limit: number,
            offset: number
        }>({
            providesTags: ['account']
            , query: (params) => ({
                url: `Accounts?${formulateQueryString(params)}&lookup=${Boolean(params?.lookup)}`,
                method: 'GET',
            })
        }),
        findAppVersion: builder.query <{ infolinkApiVersion: string }, {}>({
            query: () => ({
                url: "Settings/myversion",
                method: 'GET',
            })
        }),
        appConfig: builder.query <Config, void>({
            query: () => ({
                url: "Settings/config",
                method: 'GET',
            })
        }),
        createMember: builder.mutation<{}, CreateAccountModel>({
            invalidatesTags: ['account'],
            query: (body) => ({
                url: "Accounts/",
                method: 'POST',
                body: body
            })
        }),
        changePassword: builder.mutation<{}, ChangePasswordModel>({
            query: (body) => ({
                url: "Accounts/changePassword",
                method: 'POST',
                body: body
            })
        }),
        updateMember: builder.mutation<{}, EditModal>({
            invalidatesTags: ['account'],
            query: (body) => ({
                url: `Accounts/${body.id}`,
                method: 'POST',
                body: body
            })
        }),
        dashboardXchangesInfo: builder.query<XchangeMainInfo, void>({
            query: (body) => ({
                url: `Dashboard/XChangesAndSubscriptionsInfo`,
            })
        }),
        chartsDataPoints: builder.query<ChartPointsResponse, void>({
            query: (body) => ({
                url: `Dashboard/ChartsDataPoints`,
            })
        }),
        dashboardMainInfo: builder.query<MainInfoResponse, void>({
            query: (body) => ({
                url: `Dashboard/MainInfo`,
            })
        }),

    })
});


export const {
    useAdapterMetadataQuery,
    useAppConfigQuery,
    useChartsDataPointsQuery,
    useDashboardXchangesInfoQuery,
    useDashboardMainInfoQuery,
    useAdaptersLookupQuery,
    useProfileQuery,
    useUpdateMemberMutation,
    useFindMembersQuery,
    useRemoveMemberMutation
} = GeneralApi
