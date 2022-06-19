


export type SubscriptionFindQuery = {
    mode: string
    keywords?: string
    creationDateFrom?: string
    creationDateTo?: string
    offset: number
    limit: number
    sortBy: string
    sortByDescending: boolean
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


