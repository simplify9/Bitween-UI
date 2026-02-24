import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {
    ApiGatewayModel,
    ApiGatewayCreate,
    ApiGatewayUpdate,
    ApiGatewayPartnerCreate,
    RemovePartnerRequest
} from "src/types/apiGateways";
import {ApiPagedResponse} from "src/types/common";

export const ApiGatewaysApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "ApiGatewaysApi",
    tagTypes: ["apiGateways"],
    endpoints: (builder) => ({
        apiGateways: builder.query<ApiPagedResponse<ApiGatewayModel>, void>({
            providesTags: ['apiGateways'],
            query: () => ({
                url: 'ApiGateways',
                method: "GET",
            })
        }),
        apiGateway: builder.query<ApiGatewayModel, number>({
            providesTags: ['apiGateways'],
            query: id => ({
                url: `ApiGateways/${id}`,
                method: "GET",
            })
        }),
        createApiGateway: builder.mutation<{ id: number }, ApiGatewayCreate>({
            invalidatesTags: ['apiGateways'],
            transformResponse: (returnValue: number) => ({ id: returnValue }),
            query: body => ({
                url: 'ApiGateways',
                method: "POST",
                body
            })
        }),
        updateApiGateway: builder.mutation<{}, { id: number } & ApiGatewayUpdate>({
            invalidatesTags: ['apiGateways'],
            query: ({id, ...body}) => ({
                url: `ApiGateways/${id}`,
                method: "POST",
                body
            })
        }),
        deleteApiGateway: builder.mutation<{}, number>({
            invalidatesTags: ['apiGateways'],
            query: id => ({
                url: `ApiGateways/${id}`,
                method: "DELETE",
            })
        }),
        addPartnerToGateway: builder.mutation<{}, { gatewayId: number } & ApiGatewayPartnerCreate>({
            invalidatesTags: ['apiGateways'],
            query: ({gatewayId, ...body}) => ({
                url: `ApiGateways/${gatewayId}/addpartner`,
                method: "POST",
                body
            })
        }),
        removePartnerFromGateway: builder.mutation<{}, { gatewayId: number } & RemovePartnerRequest>({
            invalidatesTags: ['apiGateways'],
            query: ({gatewayId, ...body}) => ({
                url: `ApiGateways/${gatewayId}/removepartner`,
                method: "POST",
                body
            })
        }),
        updateGatewayPartner: builder.mutation<{}, { gatewayId: number } & ApiGatewayPartnerCreate>({
            invalidatesTags: ['apiGateways'],
            query: ({gatewayId, ...body}) => ({
                url: `ApiGateways/${gatewayId}/updatepartner`,
                method: "POST",
                body
            })
        }),
    })
});

export const {
    useApiGatewaysQuery,
    useLazyApiGatewayQuery,
    useCreateApiGatewayMutation,
    useUpdateApiGatewayMutation,
    useDeleteApiGatewayMutation,
    useAddPartnerToGatewayMutation,
    useRemovePartnerFromGatewayMutation,
    useUpdateGatewayPartnerMutation,
} = ApiGatewaysApi;
