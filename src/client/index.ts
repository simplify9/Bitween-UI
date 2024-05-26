import axios from "axios";
import {CreateXchangeModel} from "../types/xchange";
import {AdapterFindQuery} from "../types/subscriptions";
import {ChangePasswordModel, CreateAccountModel, LoginRequest} from "../types/accounts";
import {ApiResponse} from "./types";
import {PartnerFindQuery, UpdatePartner} from "../types/partners";
import {CreateDocument, DocumentFindQuery, UpdateDocument} from "../types/document";
import {OptionType} from "../types/common";
import dayjs from "dayjs";

export const client = axios.create();

export const apiClient = {

    login: async (req: LoginRequest) => {
        const res: ApiResponse = await client.post("accounts/login", req);
        return res
    },
    getProfile: async () => {
        const res: ApiResponse = await client.get("accounts/profile");
        return res
    },
    findAppVersion: async () => {
        const res: ApiResponse = await client.get("Settings/myversion");
        return res
    },
    findMembers: async (data?: { lookup?: boolean, limit?: number, offset?: number }) => {
        const res: ApiResponse = await client.get(`Accounts?lookup=${Boolean(data?.lookup)}`);
        return res
    },
    removeMember: async (id: number) => {
        const res: ApiResponse = await client.post(`Accounts/${id}/remove`, {});
        return res
    },
    createMember: async (data: CreateAccountModel) => {
        const res: ApiResponse = await client.post("Accounts/", data);
        return res
    },
    changePassword: async (data: ChangePasswordModel) => {
        const res: ApiResponse = await client.post("Accounts/changePassword", data);
        return res
    },
    createExchange: async (body: CreateXchangeModel) => {
        return await client.post(`xchanges/`, body)
    },
    getExchangeDocument: async (req: { documentKey: string }) => {
        const res = await client.get(`InfolinkDocs?documentKey=${req.documentKey}`)
        return {
            data: res.data
        }
    },
    retryExchanges: async (id: string, reset: boolean) => {
        const res: ApiResponse = await client.post(`xchanges/${id}/retry`, {
            reason: null,
            reset: reset
        })
        return res;
    },
    bulkRetryExchanges: async (ids: string[], reset: boolean) => {
        const res: ApiResponse = await client.post(`xchanges/bulkretry`, {
            reason: null,
            reset: reset,
            ids
        })
        return res;
    },
    findDocuments: async (req: DocumentFindQuery) => {
        const res = await client.get(`documents${formulateQueryString(req)}`)
        return {
            total: res.data.totalCount,
            data: res.data.result
        }
    },
    findDocument: async (id: string) => {
        const res: ApiResponse = await client.get(`documents/${id}`)
        return res
    },
    findDocumentTrail: async (id: string) => {
        const res: ApiResponse = await client.get(`documents/trail?documentId=${id}&limit=1000`)
        return res
    },
    createDocument: async (req: CreateDocument) => {
        const res: ApiResponse = await client.post("documents", req)
        return res
    },
    updateDocument: async (id: string, req: UpdateDocument) => {
        const res: ApiResponse = await client.post(`documents/${id}`, req)
        return res
    },
    deleteDocument: async (id: string) => {
        const res: ApiResponse = await client.delete(`documents/${id}`)
        return res
    },
    findPartners: async (req: PartnerFindQuery) => {
        const res = await client.get(`partners${formulateQueryString(req)}`)
        return {
            total: res.data.totalCount,
            data: res.data.result
        }
    },
    findPartner: async (id: string) => {
        const res: ApiResponse = await client.get(`partners/${id}`)
        return res
    },
    createPartner: async (name: string) => {
        const res: ApiResponse = await client.post("partners", {name})
        return res
    },
    updatePartner: async (id: string, req: UpdatePartner) => {
        const res: ApiResponse = await client.post(`partners/${id}`, req)
        return res
    },
    deletePartner: async (id: string) => {
        const res: ApiResponse = await client.delete(`partners/${id}`)
        return res
    },
    generatePartnerKey: async () => {
        const res: ApiResponse = await client.get(`partners/generatekey`)
        return res
    },
    findAdapters: async (req: AdapterFindQuery) => {

        const res = await client.get(`adapters?prefix=${req.prefix}`)
        const arr: OptionType[] = [];
        if (!res.data) return [];
        Object.keys(res.data).forEach(k => {
            arr.push({
                id: k,
                title: k
            })
        })
        return arr;

    },
    findAdapterProperties: async (id: string) => {
        const res = await client.get(`adapters/${id}/properties`)
        const arr: OptionType[] = [];
        if (!res.data) return [];
        Object.entries(res.data).forEach(([k, v]: any) => {
            arr.push({
                id: k,
                title: v
            })
        })
        return arr;
    },
    findSubscriptionTrail: async (id: number) => {
        const res: ApiResponse = await client.get(`subscriptions/trail?SubscriptionId=${id}&limit=1000`)
        return res
    },
    deleteSubscription: async (id: number) => {
        const res: ApiResponse = await client.delete(`subscriptions/${id}`)
        return res
    },

}

export type OrderBy = {
    field: string
    descending?: boolean
}

interface QueryParams {
    partnerId?: number | string
    orderBy?: OrderBy
    offset: number;
    limit: number;
    nameContains?: string;
    status?: string;
    subscription?: string;
    id?: string;
    ids?: string
    correlationId?: string;
    promotedProperties?: string;
    creationDateFrom?: string;
    creationDateTo?: string;
    test?: boolean;
    type?: string
    mapperId?: string | null
    handlerId?: string | null
    validatorId?: string | null
    receiverId?: string | null
    isRunning?: boolean | null
    categoryId?: number | null
    documentId?: number | null
}

export const formulateQueryString = (req: QueryParams) => {

    let query = `?page=${Math.floor(req.offset / req.limit)}&size=${req.limit}`;


    if ('rawfiltersproperties' in req && req.rawfiltersproperties) query += `&filter=rawfiltersproperties:4:${req.rawfiltersproperties}`;
    if ('partnerId' in req && req.partnerId) query += `&filter=partnerId:1:${req.partnerId}`;
    if ('documentId' in req && req.documentId) query += `&filter=documentId:1:${req.documentId}`;

    if ('type' in req && req.type) query += `&filter=type:1:${req.type}`;
    if ('inactive' in req && req.inactive != null) query += `&filter=inactive:1:${req.inactive}`;
    if ('handlerId' in req && req.handlerId) query += `&filter=handlerId:1:${req.handlerId}`;
    if ('validatorId' in req && req.validatorId) query += `&filter=validatorId:1:${req.validatorId}`;
    if ('receiverId' in req && req.receiverId) query += `&filter=receiverId:1:${req.receiverId}`;
    if ('isRunning' in req && req.isRunning != null) query += `&filter=isRunning:1:${req.isRunning}`;
    if ('categoryId' in req && req.categoryId) query += `&filter=categoryId:1:${req.categoryId}`;
    if ('mapperId' in req && req.mapperId) query += `&filter=mapperId:1:${req.mapperId}`;
    if ('rawsubscriptionproperties' in req && req.rawsubscriptionproperties) query += `&filter=rawsubscriptionproperties:4:${req.rawsubscriptionproperties}`;
    if ('nameContains' in req && req.nameContains) query += `&filter=name:4:${req.nameContains}`;
    if ('status' in req && req.status && req.status != '') query += `&filter=StatusFilter:1:${req.status}`;
    if ('subscription' in req && req.subscription && req.subscription != '') query += `&filter=SubscriptionId:1:${req.subscription}`;
    if ('id' in req && req.id && req.id != '') query += `&filter=Id:1:${req.id}`;
    if ('ids' in req && req.ids && req.ids != '') query += `&filter=Id:4:text|${req.ids.split(/[,|\s\n]/).map(i => i.trim()).join("|")}`;

    if ('correlationId' in req && req.correlationId && req.correlationId != '') query += `&filter=CorrelationId:1:${req.correlationId}`;
    if ('promotedProperties' in req && req.promotedProperties && req.promotedProperties != '') query += `&filter=PromotedPropertiesRaw:1:${req.promotedProperties}`;
    if ('creationDateFrom' in req && req.creationDateFrom && req.creationDateFrom != '') query += `&filter=StartedOn:6:${dayjs(req.creationDateFrom).set('h', 0).set('m', 0).toISOString()}`;
    if ('creationDateTo' in req && req.creationDateTo && req.creationDateTo != '') query += `&filter=StartedOn:8:${dayjs(req.creationDateTo).set('h', 23).set('m', 59).toISOString()}`;
    if ('test' in req && req.test) query += `&test=${req.test}`;
    if ('orderBy' in req && req.orderBy?.field) query += `&sort=${req.orderBy?.field}:${req.orderBy?.descending ? 2 : 1}`;
    return query;
}





