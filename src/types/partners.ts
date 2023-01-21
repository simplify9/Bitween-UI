import {CommonFindQuery, KeyValuePair} from "./common";


export interface IPartner{
    id:string
    name:string;
    subscriptionsCount?:number;
    keys?:number
    apiCredentials?:any[];
    subscriptions?:any[]

}
export type PartnerFindQuery = CommonFindQuery &  {
    nameContains: string

}

export type UpdatePartner = {
    name?:string;
    apiCredentials?: KeyValuePair[]
}
