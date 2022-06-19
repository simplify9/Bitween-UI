import {KeyValuePair} from "./common";


export interface IPartner{
    id:string
    name:string;
    subscriptionCount?:number;
    keys?:number
    apiCredentials?:any[];
    subscriptions?:any[]

}
export type PartnerFindQuery = {
    nameContains: string
    offset: number
    limit: number
    sortBy: string
    sortByDescending: boolean
}

export type UpdatePartner = {
    name?:string;
    apiCredentials?: KeyValuePair[]
}
