export interface ChartPointsResponse {
    subscriptionsUsageCount: SubscriptionsUsageCount[]
    xChangesPerDay: XChangesPerDay[]
    lastUpdated: string
}

export interface SubscriptionsUsageCount {
    subscriptionId: number
    count: number
}

export interface XChangesPerDay {
    dateTime: string
    count: number
}


export interface MainInfoResponse {
    subscriptionsCount: number
    documentCount: number
    notifiersCount: number
    usersCount: number
    partnersCount: number
    lastUpdated: string
}


export interface XchangeMainInfo {
    successfulXchanges: number
    latestFailedxCahanges: LatestFailedXcahange[]
    failedXchanges: number
    badResponseXchanges: number
    totalXchangesCount: number
    xChangeCountInTimeframe: number
    lastUpdated: string
}

export interface LatestFailedXcahange {
    subscriptionName: string
    finishedOn: string
    responseBad: boolean
    exception?: string
}
