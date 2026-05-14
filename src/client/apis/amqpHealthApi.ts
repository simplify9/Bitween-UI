import { createApi } from '@reduxjs/toolkit/query/react';
import customFetchBase from 'src/client/apis/apiMiddleware';
import {
    DashboardSummary,
    ConsumerHealthView,
    QueueDetailView,
    RetryAnalysisView,
    DeadLetterSummaryView,
    DashboardAlert,
} from 'src/types/amqpHealth';

export const AmqpHealthApi = createApi({
    baseQuery: customFetchBase,
    reducerPath: 'AmqpHealthApi',
    tagTypes: ['amqpHealth'],
    endpoints: (builder) => ({
        getAmqpSummary: builder.query<DashboardSummary, void>({
            providesTags: ['amqpHealth'],
            query: () => ({ url: 'Ops/Summary', method: 'GET' }),
        }),
        getAmqpConsumers: builder.query<ConsumerHealthView[], void>({
            providesTags: ['amqpHealth'],
            query: () => ({ url: 'Ops/Consumers', method: 'GET' }),
        }),
        getAmqpQueues: builder.query<QueueDetailView[], void>({
            providesTags: ['amqpHealth'],
            query: () => ({ url: 'Ops/Queues', method: 'GET' }),
        }),
        getAmqpRetries: builder.query<RetryAnalysisView[], void>({
            providesTags: ['amqpHealth'],
            query: () => ({ url: 'Ops/Retries', method: 'GET' }),
        }),
        getAmqpDeadLetters: builder.query<DeadLetterSummaryView[], void>({
            providesTags: ['amqpHealth'],
            query: () => ({ url: 'Ops/DeadLetters', method: 'GET' }),
        }),
        getAmqpAlerts: builder.query<DashboardAlert[], void>({
            providesTags: ['amqpHealth'],
            query: () => ({ url: 'Ops/Alerts', method: 'GET' }),
        }),
    }),
});

export const {
    useGetAmqpSummaryQuery,
    useGetAmqpConsumersQuery,
    useGetAmqpQueuesQuery,
    useGetAmqpRetriesQuery,
    useGetAmqpDeadLettersQuery,
    useGetAmqpAlertsQuery,
} = AmqpHealthApi;
