import axios, {Axios, AxiosInstance} from "axios";
import { ExchangeFindQuery} from "../types/xchange";
import {ICreateSubscription, IUpdateSubscription, SubscriptionFindQuery} from "../types/subscriptions";
import {LoginRequest, LoginResponse} from "../types/accounts";
import {ApiResponse} from "./types";
import {PartnerFindQuery, UpdatePartner} from "../types/partners";
import {CreateDocument, DocumentFindQuery, UpdateDocument} from "../types/document";

export const client = axios.create();

export const apiClient = {

    login: async (req: LoginRequest) => {
        let res:ApiResponse = await client.post("accounts/login", req)
        return res
    },

    findExchanges: async (req: ExchangeFindQuery) => {
        let res = await client.get(`xchanges${formulateQueryString(req)}`)
        return {
            total: res.data.totalCount,
            data: res.data.result
        }
    },
    findDocuments: async (req: DocumentFindQuery) => {
        let res = await client.get(`documents${formulateQueryString(req)}`)
        return {
            total: res.data.totalCount,
            data: res.data.result
        }
    },
    findDocument: async (id: string) => {
        let res:ApiResponse = await client.get(`documents/${id}`)
        return res
    },
    createDocument: async (req: CreateDocument) => {
        let res:ApiResponse = await client.post("documents",req)
        return res
    },
    updateDocument: async (id:string,req: UpdateDocument) => {
        let res:ApiResponse = await client.post(`documents/${id}`,req)
        return res
    },
    deleteDocument: async (id:string) => {
        let res:ApiResponse = await client.delete(`documents/${id}`)
        return res
    },
    findPartners: async (req: PartnerFindQuery) => {
        let res = await client.get(`partners${formulateQueryString(req)}`)
        return {
            total: res.data.totalCount,
            data: res.data.result
        }
    },
    findPartner: async (id: string) => {
        let res:ApiResponse = await client.get(`partners/${id}`)
        return res
    },
    createPartner: async (name: string) => {
        let res:ApiResponse = await client.post("partners",{name})
        return res
    },
    updatePartner: async (id:string,req: UpdatePartner) => {
        let res:ApiResponse = await client.post(`partners/${id}`,req)
        return res
    },
    deletePartner: async (id:string) => {
        let res:ApiResponse = await client.delete(`partners/${id}`)
        return res
    },
    generatePartnerKey: async () => {
        let res:ApiResponse = await client.get(`partners/generatekey`)
        return res
    },
    findSubscriptions: async (req: SubscriptionFindQuery) => {

        let res = await client.get(`subscriptions${formulateQueryString(req)}`)
        return {
            total: res.data.totalCount,
            data: res.data.result
        }

    },
    findSubscription: async (id: string) => {
        let res:ApiResponse = await client.get(`subscriptions/${id}`)
        return res
    },
    createSubscription: async (req: ICreateSubscription) => {
        let res:ApiResponse = await client.post("subscriptions",req)
        return res
    },
    updateSubscription: async (id:string,req: IUpdateSubscription) => {
        let res:ApiResponse = await client.post(`subscriptions/${id}`,req)
        return res
    },
    deleteSubscription: async (id:string) => {
        let res:ApiResponse = await client.delete(`subscriptions/${id}`)
        return res
    },

}

const formulateQueryString = (req:any) => {
    return `?page=${Math.floor(req.offset / req.limit)}&size=${req.limit}`
}





