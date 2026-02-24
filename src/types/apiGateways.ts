export type ApiGatewayPartnerDto = {
    partnerId: number;
    subscriptionId: number;
    partnerName: string;
    subscriptionName: string;
}

export type ApiGatewayModel = {
    id: number;
    name: string;
    urlName: string;
    partnersCount?: number;
    partners?: ApiGatewayPartnerDto[];
}

export type ApiGatewayCreate = {
    name: string;
    urlName: string;
}

export type ApiGatewayUpdate = {
    name: string;
    urlName: string;
    partners?: ApiGatewayPartnerDto[];
}

export type ApiGatewayPartnerCreate = {
    partnerId: number;
    subscriptionId: number;
}

export type RemovePartnerRequest = {
    partnerId: number;
}
