import {MatchExpression} from "./subscriptions";

export type BusGatewayRouteDto = {
    id: number;
    subscriptionId: number;
    subscriptionName: string;
    partnerId?: number | null;
    partnerName?: string | null;
    matchExpression?: MatchExpression | null;
}

export type BusGatewayModel = {
    id: number;
    name: string;
    documentId: number;
    documentName?: string;
    routesCount?: number;
    routes?: BusGatewayRouteDto[];
}

export type BusGatewayCreate = {
    name: string;
    documentId: number;
}

export type BusGatewayUpdate = {
    name: string;
}

export type BusGatewayRouteCreate = {
    subscriptionId: number;
    partnerId?: number | null;
    matchExpression?: MatchExpression | null;
}

export type BusGatewayRouteUpdate = BusGatewayRouteCreate & {
    routeId: number;
}

export type RemoveRouteRequest = {
    routeId: number;
}
