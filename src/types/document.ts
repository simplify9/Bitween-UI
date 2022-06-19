import {CommonFindQuery, KeyValuePair} from "./common";


export interface IDocument{
    id:string
    name:string;
    busMessageTypeName?:string;
    busEnabled?:boolean
    duplicateInterval?:any
    promotedProperties?:any
}
export type DocumentFindQuery = CommonFindQuery &  {
    mode: string

}


export type UpdateDocument = {
    id?:string
    name?:string
    busEnabled?:boolean
    busMessageTypeName?: string;
    duplicateInterval?:string;
    promotedProperties?:KeyValuePair[]
}
export type CreateDocument = {
    id?:string;
    name?:string
}
