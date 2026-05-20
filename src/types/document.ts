import {CommonFindQuery, KeyValuePair, OptionType} from "./common";


export interface IDocument {
    id: string
    name: string;
    busMessageTypeName?: string;
    busEnabled?: boolean
    duplicateInterval?: any
    promotedProperties?: any
    disregardsUnfilteredMessages?: boolean
    documentFormat?: string
}

export type DocumentFindQuery = CommonFindQuery & {
    nameContains: string

}


export const DocumentFormat: OptionType[] = [
    {id: "Json", title: "Json"},
    {id: "Xml", title: "Xml"},
]
export type UpdateDocument = {
    id?: string
    name?: string
    busEnabled?: boolean
    busMessageTypeName?: string;
    duplicateInterval?: string;
    promotedProperties?: KeyValuePair[]
    disregardsUnfilteredMessages?: boolean
    documentFormat?: string
}
export type CreateDocument = {
    id?: string;
    name?: string
}
