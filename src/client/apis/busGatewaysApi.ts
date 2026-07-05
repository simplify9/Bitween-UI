import {createApi} from '@reduxjs/toolkit/query/react';
import customFetchBase from "src/client/apis/apiMiddleware";
import {
    BusGatewayModel,
    BusGatewayCreate,
    BusGatewayUpdate,
    BusGatewayRouteCreate,
    BusGatewayRouteUpdate,
    RemoveRouteRequest
} from "src/types/busGateways";
import {ApiPagedResponse} from "src/types/common";

export const BusGatewaysApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: "BusGatewaysApi",
    tagTypes: ["busGateways"],
    endpoints: (builder) => ({
        busGateways: builder.query<ApiPagedResponse<BusGatewayModel>, void>({
            providesTags: ['busGateways'],
            query: () => ({
                url: 'BusGateways',
                method: "GET",
            })
        }),
        busGateway: builder.query<BusGatewayModel, number>({
            providesTags: ['busGateways'],
            query: id => ({
                url: `BusGateways/${id}`,
                method: "GET",
            })
        }),
        createBusGateway: builder.mutation<{ id: number }, BusGatewayCreate>({
            invalidatesTags: ['busGateways'],
            transformResponse: (returnValue: number) => ({ id: returnValue }),
            query: body => ({
                url: 'BusGateways',
                method: "POST",
                body
            })
        }),
        updateBusGateway: builder.mutation<{}, { id: number } & BusGatewayUpdate>({
            invalidatesTags: ['busGateways'],
            query: ({id, ...body}) => ({
                url: `BusGateways/${id}`,
                method: "POST",
                body
            })
        }),
        deleteBusGateway: builder.mutation<{}, number>({
            invalidatesTags: ['busGateways'],
            query: id => ({
                url: `BusGateways/${id}`,
                method: "DELETE",
            })
        }),
        addRouteToGateway: builder.mutation<{}, { gatewayId: number } & BusGatewayRouteCreate>({
            invalidatesTags: ['busGateways'],
            query: ({gatewayId, ...body}) => ({
                url: `BusGateways/${gatewayId}/addroute`,
                method: "POST",
                body
            })
        }),
        removeRouteFromGateway: builder.mutation<{}, { gatewayId: number } & RemoveRouteRequest>({
            invalidatesTags: ['busGateways'],
            query: ({gatewayId, ...body}) => ({
                url: `BusGateways/${gatewayId}/removeroute`,
                method: "POST",
                body
            })
        }),
        updateGatewayRoute: builder.mutation<{}, { gatewayId: number } & BusGatewayRouteUpdate>({
            invalidatesTags: ['busGateways'],
            query: ({gatewayId, ...body}) => ({
                url: `BusGateways/${gatewayId}/updateroute`,
                method: "POST",
                body
            })
        }),
    })
});

export const {
    useBusGatewaysQuery,
    useLazyBusGatewayQuery,
    useCreateBusGatewayMutation,
    useUpdateBusGatewayMutation,
    useDeleteBusGatewayMutation,
    useAddRouteToGatewayMutation,
    useRemoveRouteFromGatewayMutation,
    useUpdateGatewayRouteMutation,
} = BusGatewaysApi;
