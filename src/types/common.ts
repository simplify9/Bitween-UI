import {OrderBy} from "src/client";

export interface BaseSearchModel {
    offset: number,
    limit: number

}


export type ApiPagedResponse<T> = {
    result: Array<T>,
    totalCount: number

}

export interface KeyValuePair {
    key: string;
    value: string;
}

export type OptionType = {
    id: string
    title: string
}

export type CommonFindQuery = {
    offset: number
    limit: number
    orderBy?: OrderBy
}
