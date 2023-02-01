import axios from "axios";
import {CreateXchangeModel, ExchangeFindQuery} from "../types/xchange";
import {AdapterFindQuery, ICreateSubscription, ISubscription, SubscriptionFindQuery} from "../types/subscriptions";
import {ChangePasswordModel, CreateAccountModel, LoginRequest} from "../types/accounts";
import {ApiResponse} from "./types";
import {PartnerFindQuery, UpdatePartner} from "../types/partners";
import {CreateDocument, DocumentFindQuery, UpdateDocument} from "../types/document";
import {OptionType} from "../types/common";

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
    findMembers: async () => {
        const res: ApiResponse = await client.get("Accounts/");
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
        return await client.post(`xchanges/`,body)
    },
    findExchanges: async (req: ExchangeFindQuery) => {
        const res = await client.get(`xchanges${formulateQueryString(req)}`)
        return {
            total: res.data.totalCount,
            data: res.data.result
        }
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
    findSubscriptions: async (req: SubscriptionFindQuery) => {

        const res = await client.get(`subscriptions${formulateQueryString(req)}`)
        return {
            total: res.data.totalCount,
            data: res.data.result
        }

    },
    findSubscription: async (id: string) => {
        const res: ApiResponse = await client.get(`subscriptions/${id}`)
        return res
    },
    createSubscription: async (req: ICreateSubscription) => {
        const res: ApiResponse = await client.post("subscriptions", req)
        return res
    },
    updateSubscription: async (id: string, req: ISubscription) => {
        const res: ApiResponse = await client.post(`subscriptions/${id}`, req)
        return res
    },
    deleteSubscription: async (id: string) => {
        const res: ApiResponse = await client.delete(`subscriptions/${id}`)
        return res
    },

}

const formulateQueryString = (req: any) => {
    let query = `?page=${Math.floor(req.offset / req.limit)}&size=${req.limit}`;
    if ('nameContains' in req && req.nameContains) query += `&filter=name:4:${req.nameContains}`;

    if ('status' in req && req.status && req.status != '') query += `&filter=StatusFilter:1:${req.status}`;
    if ('subscription' in req && req.subscription && req.subscription != '') query += `&filter=SubscriptionId:1:${req.subscription}`;
    if ('id' in req && req.id && req.id != '') query += `&filter=Id:1:${req.id}`;
    if ('correlationId' in req && req.correlationId && req.correlationId != '') query += `&filter=CorrelationId:1:${req.correlationId}`;
    if ('promotedProperties' in req && req.promotedProperties && req.promotedProperties != '') query += `&filter=PromotedPropertiesRaw:1:${req.promotedProperties}`;
    if ('creationDateFrom' in req && req.creationDateFrom && req.creationDateFrom != '') query += `&filter=StartedOn:6:${req.creationDateFrom}`;
    if ('creationDateTo' in req && req.creationDateTo && req.creationDateTo != '') query += `&filter=StartedOn:8:${req.creationDateTo}`;
    if ('test' in req && req.test) query += `&test=${req.test}`;

    return query;
}





