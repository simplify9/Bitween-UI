import React from 'react';
import { DashboardSummary } from 'src/types/amqpHealth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
    TbUsers, TbAlertTriangle, TbWifi, TbInbox,
    TbRefresh, TbSkull, TbArrowUp, TbArrowDown, TbBell,
    TbAlertCircle, TbCircleCheck,
} from 'react-icons/tb';

dayjs.extend(relativeTime);

type OverallStatus = 'healthy' | 'degraded' | 'critical';
type Accent = 'red' | 'amber' | 'blue' | 'none';

const getOverallStatus = (s: DashboardSummary): OverallStatus => {
    if (s.disconnectedConsumers > 0 || s.totalDeadLetterBacklog > 0) return 'critical';
    if (s.unhealthyConsumers > 0 || s.totalRetryBacklog > 0 || s.activeAlerts > 0) return 'degraded';
    return 'healthy';
};

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    accent?: Accent;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, accent = 'none' }) => {
    const accentBorder = accent === 'red'
        ? 'border-l-4 border-l-red-400'
        : accent === 'amber'
        ? 'border-l-4 border-l-amber-400'
        : accent === 'blue'
        ? 'border-l-4 border-l-blue-400'
        : '';

    const valueCls = accent === 'red'
        ? 'text-red-600'
        : accent === 'amber'
        ? 'text-amber-600'
        : accent === 'blue'
        ? 'text-blue-600'
        : 'text-gray-800';

    const iconBg = accent === 'red'
        ? 'bg-red-50'
        : accent === 'amber'
        ? 'bg-amber-50'
        : accent === 'blue'
        ? 'bg-blue-50'
        : 'bg-primary-50';

    return (
        <div className={`flex items-center gap-3 bg-white rounded-xl px-4 py-4 shadow-sm border border-gray-100 ${accentBorder}`}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${iconBg}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <div className={`text-2xl font-bold leading-none mb-1 ${valueCls}`}>{value}</div>
                <div className="text-xs text-gray-500 leading-tight">{label}</div>
            </div>
        </div>
    );
};

interface Props {
    summary: DashboardSummary;
    isFetching: boolean;
    onRefresh: () => void;
}

const SummaryCards: React.FC<Props> = ({ summary, isFetching, onRefresh }) => {
    const status = getOverallStatus(summary);

    const banner = {
        healthy: {
            wrapper: 'bg-green-50 border border-green-200',
            dot: 'bg-green-400',
            ring: 'bg-green-300',
            text: 'text-green-800',
            sub: 'text-green-600',
            badge: 'bg-green-200 text-green-800',
            icon: <TbCircleCheck className="text-green-500 shrink-0" size={22} />,
            label: 'HEALTHY',
            desc: 'All systems operational',
        },
        degraded: {
            wrapper: 'bg-amber-50 border border-amber-200',
            dot: 'bg-amber-400',
            ring: 'bg-amber-300',
            text: 'text-amber-800',
            sub: 'text-amber-600',
            badge: 'bg-amber-200 text-amber-800',
            icon: <TbAlertTriangle className="text-amber-500 shrink-0" size={22} />,
            label: 'DEGRADED',
            desc: 'Some consumers need attention',
        },
        critical: {
            wrapper: 'bg-red-50 border border-red-200',
            dot: 'bg-red-500',
            ring: 'bg-red-300',
            text: 'text-red-800',
            sub: 'text-red-600',
            badge: 'bg-red-200 text-red-800',
            icon: <TbAlertCircle className="text-red-500 shrink-0" size={22} />,
            label: 'CRITICAL',
            desc: 'Immediate attention required',
        },
    }[status];

    return (
        <div className="flex flex-col gap-3">

            {/* ── Status banner ── */}
            <div className={`flex items-center justify-between rounded-xl px-5 py-4 ${banner.wrapper}`}>
                <div className="flex items-center gap-3">
                    {/* live pulse dot */}
                    <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${banner.ring}`} />
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${banner.dot}`} />
                    </div>
                    {banner.icon}
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold tracking-wider text-sm ${banner.text}`}>
                                {banner.label}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${banner.badge}`}>
                                {summary.totalConsumers} consumer{summary.totalConsumers !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${banner.sub}`}>{banner.desc}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:block">
                        Updated {dayjs(summary.lastUpdatedUtc).fromNow()}
                    </span>
                    <button
                        onClick={onRefresh}
                        disabled={isFetching}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                        <TbRefresh className={isFetching ? 'animate-spin' : ''} size={15} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* ── Metric cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <MetricCard
                    icon={<TbUsers className="text-primary-600" size={20} />}
                    label="Total Consumers"
                    value={summary.totalConsumers}
                />
                <MetricCard
                    icon={<TbAlertTriangle className={summary.unhealthyConsumers > 0 ? 'text-amber-500' : 'text-gray-300'} size={20} />}
                    label="Unhealthy"
                    value={summary.unhealthyConsumers}
                    accent={summary.unhealthyConsumers > 0 ? 'amber' : 'none'}
                />
                <MetricCard
                    icon={<TbWifi className={summary.disconnectedConsumers > 0 ? 'text-red-500' : 'text-gray-300'} size={20} />}
                    label="Disconnected"
                    value={summary.disconnectedConsumers}
                    accent={summary.disconnectedConsumers > 0 ? 'red' : 'none'}
                />
                <MetricCard
                    icon={<TbInbox className={summary.totalQueueDepth > 0 ? 'text-blue-500' : 'text-gray-300'} size={20} />}
                    label="Queue Depth"
                    value={summary.totalQueueDepth}
                    accent={summary.totalQueueDepth > 0 ? 'blue' : 'none'}
                />
                <MetricCard
                    icon={<TbRefresh className={summary.totalRetryBacklog > 0 ? 'text-amber-500' : 'text-gray-300'} size={20} />}
                    label="Retry Backlog"
                    value={summary.totalRetryBacklog}
                    accent={summary.totalRetryBacklog > 0 ? 'amber' : 'none'}
                />
                <MetricCard
                    icon={<TbSkull className={summary.totalDeadLetterBacklog > 0 ? 'text-red-500' : 'text-gray-300'} size={20} />}
                    label="Dead Letters"
                    value={summary.totalDeadLetterBacklog}
                    accent={summary.totalDeadLetterBacklog > 0 ? 'red' : 'none'}
                />
                <MetricCard
                    icon={<TbBell className={summary.activeAlerts > 0 ? 'text-red-500' : 'text-gray-300'} size={20} />}
                    label="Active Alerts"
                    value={summary.activeAlerts}
                    accent={summary.activeAlerts > 0 ? 'red' : 'none'}
                />
            </div>

            {/* ── Throughput row ── */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-white rounded-xl px-5 py-3.5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 shrink-0">
                        <TbArrowUp className="text-primary-600" size={18} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 mb-0.5">Incoming Rate</div>
                        <div className="text-lg font-bold text-gray-800 leading-none">
                            {summary.totalIncomingRate.toFixed(2)}
                            <span className="text-xs font-normal text-gray-400 ml-1">msg/s</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-xl px-5 py-3.5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 shrink-0">
                        <TbArrowDown className="text-green-600" size={18} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 mb-0.5">Acknowledge Rate</div>
                        <div className="text-lg font-bold text-gray-800 leading-none">
                            {summary.totalAckRate.toFixed(2)}
                            <span className="text-xs font-normal text-gray-400 ml-1">msg/s</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default React.memo(SummaryCards);
