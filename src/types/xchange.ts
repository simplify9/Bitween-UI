import {CommonFindQuery} from "./common";


export interface IXchange {
    id: string;
    subscriptionId: number | null;
    subscriptionName: string;
    documentId: number;
    documentName: string;
    handlerId: string;
    mapperId: string;
    references: string[];
    status: boolean | null;
    statusFilter: number;
    statusString: string;
    exception: string;
    deliveredOn: string | null;
    finishedOn: string | null;
    aggregatedOn: string | null;
    startedOn: string;
    inputFileName: string;
    inputFileSize: number;
    inputFileHash: string;
    outputFileName: string;
    responseFileName: string;
    inputUrl: string;
    outputUrl: string;
    responseUrl: string;
    inputKey: string;
    outputKey: string;
    responseKey: string;
    duration: string;
    promotedProperties: any;
    promotedPropertiesRaw: string;
    retryFor: string;
    aggregationXchangeId: string;
    outputBad: boolean | null;
    responseBad: boolean | null;
    correlationId: string;
    partnerId: number | null;
}


export type CreateXchangeModel = {
    option: string
    documentId: string
    subscriberId: string
    data: string
}

export type ExchangeFindQuery = CommonFindQuery & {
    mode: string
    subscription?: string
    status?: string
    id?: string
    correlationId?: string
    promotedProperties?: string
}

export type ExchangeDisplayStatus = "good" | "pending" | "bad"
export type ExchangeDisplayType = "receiver" | "mapper" | "handler" | "skipped"
