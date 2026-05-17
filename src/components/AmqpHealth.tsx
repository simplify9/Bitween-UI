import React from 'react';
import {
    useGetAmqpSummaryQuery,
    useGetAmqpConsumersQuery,
    useGetAmqpRetriesQuery,
    useGetAmqpDeadLettersQuery,
    useGetAmqpAlertsQuery,
} from 'src/client/apis/amqpHealthApi';
import SummaryCards from 'src/components/AmqpHealth/SummaryCards';
import AlertsPanel from 'src/components/AmqpHealth/AlertsPanel';
import ConsumerHealthTable from 'src/components/AmqpHealth/ConsumerHealthTable';
import RetryAnalysisTable from 'src/components/AmqpHealth/RetryAnalysisTable';
import DeadLetterTable from 'src/components/AmqpHealth/DeadLetterTable';

const POLL_INTERVAL = 3_000;

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className ?? 'h-20'}`} />
);

const AmqpHealth: React.FC = () => {
    const summary     = useGetAmqpSummaryQuery(undefined,    { pollingInterval: POLL_INTERVAL });
    const consumers   = useGetAmqpConsumersQuery(undefined,  { pollingInterval: POLL_INTERVAL });
    const retries     = useGetAmqpRetriesQuery(undefined,    { pollingInterval: POLL_INTERVAL });
    const deadLetters = useGetAmqpDeadLettersQuery(undefined,{ pollingInterval: POLL_INTERVAL });
    const alerts      = useGetAmqpAlertsQuery(undefined,     { pollingInterval: POLL_INTERVAL });

    const isLoading = summary.isLoading || consumers.isLoading || retries.isLoading
        || deadLetters.isLoading || alerts.isLoading;

    const hasError = summary.isError || consumers.isError || retries.isError
        || deadLetters.isError || alerts.isError;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                {/* banner */}
                <Skeleton className="h-16" />
                {/* metric cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
                </div>
                {/* throughput */}
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-14" />
                    <Skeleton className="h-14" />
                </div>
                {/* consumer table */}
                <Skeleton className="h-56" />
                {/* bottom tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm py-20 gap-3 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-gray-700 font-semibold">Could not load AMQP health data</p>
                <p className="text-sm text-gray-400 max-w-sm">
                    Make sure the backend exposes the{' '}
                    <span className="font-mono bg-gray-100 px-1 rounded">api/Ops/*</span>{' '}
                    endpoints and RabbitMQ Management API is configured.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Description */}
            <p className="text-xs text-gray-400">
                Live RabbitMQ consumer health &amp; queue statistics · auto-refreshes every {POLL_INTERVAL / 1000}s
            </p>

            {/* KPI summary */}
            {summary.data && (
                <SummaryCards
                    summary={summary.data}
                    isFetching={summary.isFetching}
                    onRefresh={summary.refetch}
                />
            )}

            {/* Active alerts — only when present */}
            {alerts.data && alerts.data.length > 0 && (
                <AlertsPanel alerts={alerts.data} />
            )}

            {/* Consumer health table */}
            {consumers.data && (
                <ConsumerHealthTable consumers={consumers.data} />
            )}

            {/* Retry + Dead-letter side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RetryAnalysisTable retries={retries.data ?? []} />
                <DeadLetterTable deadLetters={deadLetters.data ?? []} />
            </div>
        </div>
    );
};

export default AmqpHealth;
