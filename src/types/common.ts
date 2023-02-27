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
    keywords?: string
    creationDateFrom?: string
    creationDateTo?: string
    offset: number
    limit: number
    sortBy: string
    sortByDescending: boolean
}
