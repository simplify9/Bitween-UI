export type AlertSeverity = 'Info' | 'Warning' | 'Critical';

export interface DashboardSummary {
    totalConsumers: number;
    unhealthyConsumers: number;
    disconnectedConsumers: number;
    totalQueueDepth: number;
    totalRetryBacklog: number;
    totalDeadLetterBacklog: number;
    totalIncomingRate: number;
    totalAckRate: number;
    activeAlerts: number;
    lastUpdatedUtc: string;
}

export interface ConsumerHealthView {
    name: string;
    messageName: string;
    queueName: string;
    totalNodes: number;
    processingCount: number;
    queueCount: number;
    retryCount: number;
    failedCount: number;
    priority: number;
    prefetch: number;
    incomingRate: number;
    processingRate: number;
    ackRate: number;
    isBackpressured: boolean;
    healthStatus: AlertSeverity;
}

export interface QueueDetailView {
    queueName: string;
    retryQueueName: string;
    deadLetterQueueName: string;
    messages: number;
    consumers: number;
    unacknowledged: number;
    retryMessages: number;
    deadLetterMessages: number;
    incomingRate: number;
    processingRate: number;
    ackRate: number;
}

export interface RetryAnalysisView {
    consumerName: string;
    messageName: string;
    queueName: string;
    retryBacklog: number;
    incomingRate: number;
    ackRate: number;
    severity: AlertSeverity;
}

export interface DeadLetterSummaryView {
    consumerName: string;
    messageName: string;
    deadLetterQueueName: string;
    deadLetterCount: number;
    lastExceptionType: string | null;
    lastExceptionMessage: string | null;
    lastFailedAt: string | null;
    severity: AlertSeverity;
}

export interface DashboardAlert {
    severity: AlertSeverity;
    title: string;
    detail: string;
    queueName: string;
    consumerName: string;
    timestampUtc: string;
}
