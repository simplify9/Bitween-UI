import {CommonFindQuery, OptionType} from "./common";


export type SubscriptionFindQuery = CommonFindQuery &  {
    mode: string
}

export interface ISubscription{
    id:string
    name?:string;
    documentId?:number;
    partnerId?:number;
    aggregationForId?:number;
    type: any
    documentName?:string;
    isRunning?:boolean;
    handlerId: string;
    mapperId: string;
    receiverId: string;
    validatorId: string;
    temporary: boolean;
    handlerProperties: any[];
    validatorProperties: any[];
    mapperProperties: any[];
    receiverProperties: any[];
    documentFilter: any[];
    inactive: boolean;
    schedules: any[];
    responseSubscriptionId: number | null;
    responseMessageTypeName: string;
    receiveOn: string | null;
    aggregateOn: string | null;
    consecutiveFailures: number;
    lastException: string;
    aggregationTarget: 'Input' | 'Output' | 'Response';
    pausedOn: string | null;
}

export interface ICreateSubscription{
   type?:string;
   name?:string;
   documentId?:string;
   partnerId?:string;
   aggregationForId?:string;
}

export interface IUpdateSubscription{
    name?:string
}

export const SubscriptionTypeOptions: OptionType[] = [{ id: "0", title: "Unknown" },
    { id: "1", title: "Internal" },
    { id: "2", title: "ApiCall"},
    { id: "4", title: "Receiving" },
    { id: "8", title: "Aggregation" }]

