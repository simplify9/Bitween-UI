export interface DelayedRetryRow {
    id: string;
    on: string;
    subscriptionId?: number | null;
    subscriptionName?: string;
    documentId: number;
    documentName: string;
    exception?: string;
    startedOn: string;
}

export interface DelayedRetriesSearchModel {
    limit: number;
    offset: number;
    subscription?: string;
    documentId?: number;
    exception?: string;
    scheduledFrom?: string;
    scheduledTo?: string;
}
