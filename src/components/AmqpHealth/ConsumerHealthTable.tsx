import React, { useState } from 'react';
import { ConsumerHealthView, AlertSeverity } from 'src/types/amqpHealth';
import Tooltip from 'src/components/common/Tooltip';

type FilterType = 'all' | 'Warning' | 'Critical';

interface Props {
    consumers: ConsumerHealthView[];
}

const SEVERITY_ORDER: Record<AlertSeverity, number> = { Critical: 0, Warning: 1, Info: 2 };

// Left border accent per health status
const ROW_BORDER: Record<AlertSeverity, string> = {
    Info:     'border-l-4 border-l-transparent',
    Warning:  'border-l-4 border-l-amber-400',
    Critical: 'border-l-4 border-l-red-500',
};

// Zebra row bg — even rows get a tint; problem rows override with a color tint
const zebraBase = (i: number) => i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';

const ROW_TINT: Record<AlertSeverity, string> = {
    Info:     '',           // use zebra
    Warning:  'bg-amber-50/60',
    Critical: 'bg-red-50/70',
};

const HEALTH_BADGE: Record<AlertSeverity, { dot: string; text: string; bg: string }> = {
    Info:     { dot: 'bg-green-400',  text: 'text-green-700',  bg: 'bg-green-50'  },
    Warning:  { dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50'  },
    Critical: { dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50'    },
};

interface FilterTabProps {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
    countCls?: string;
}

const FilterTab: React.FC<FilterTabProps> = ({ active, onClick, label, count, countCls = 'bg-gray-200 text-gray-500' }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            active ? 'bg-white shadow-sm text-gray-700' : 'text-gray-500 hover:text-gray-700'
        }`}
    >
        {label}
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? countCls : 'bg-gray-200 text-gray-500'}`}>
            {count}
        </span>
    </button>
);

const ConsumerHealthTable: React.FC<Props> = ({ consumers }) => {
    const [filter, setFilter] = useState<FilterType>('all');

    const warningCount  = consumers.filter(c => c.healthStatus === 'Warning').length;
    const criticalCount = consumers.filter(c => c.healthStatus === 'Critical').length;

    const sorted = [...consumers].sort(
        (a, b) => SEVERITY_ORDER[a.healthStatus] - SEVERITY_ORDER[b.healthStatus]
    );
    const filtered = filter === 'all' ? sorted : sorted.filter(c => c.healthStatus === filter);

    return (
        <div className="flex flex-col gap-2">

            {/* ── Section header ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary-500 rounded-full" />
                    <h3 className="text-sm font-semibold text-gray-700">Consumer Health</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {consumers.length}
                    </span>
                </div>
                {consumers.length > 0 && (
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <FilterTab
                            active={filter === 'all'}
                            onClick={() => setFilter('all')}
                            label="All"
                            count={consumers.length}
                            countCls="bg-gray-200 text-gray-600"
                        />
                        {warningCount > 0 && (
                            <FilterTab
                                active={filter === 'Warning'}
                                onClick={() => setFilter('Warning')}
                                label="Warning"
                                count={warningCount}
                                countCls="bg-amber-100 text-amber-700"
                            />
                        )}
                        {criticalCount > 0 && (
                            <FilterTab
                                active={filter === 'Critical'}
                                onClick={() => setFilter('Critical')}
                                label="Critical"
                                count={criticalCount}
                                countCls="bg-red-100 text-red-700"
                            />
                        )}
                    </div>
                )}
            </div>

            {consumers.length === 0 ? (
                <div className="flex items-center justify-center bg-white rounded-xl shadow-sm py-12 text-gray-400 text-sm">
                    No consumers registered.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                    <table className="min-w-full text-sm border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                                <th className="sticky top-0 text-left px-4 py-3 font-semibold bg-gray-100 border-b border-gray-200 first:rounded-tl-xl">Consumer</th>
                                <th className="sticky top-0 text-left px-4 py-3 font-semibold bg-gray-100 border-b border-gray-200">Message Type</th>
                                <th className="sticky top-0 text-right px-4 py-3 font-semibold bg-gray-100 border-b border-gray-200">Nodes</th>
                                <th className="sticky top-0 text-right px-4 py-3 font-semibold bg-gray-100 border-b border-gray-200">Queue</th>
                                <th className="sticky top-0 text-right px-4 py-3 font-semibold bg-gray-100 border-b border-gray-200">In-Flight</th>
                                <th className="sticky top-0 text-right px-4 py-3 font-semibold bg-gray-100 border-b border-gray-200">Retry</th>
                                <th className="sticky top-0 text-right px-4 py-3 font-semibold bg-gray-100 border-b border-gray-200">Dead Letter</th>
                                <th className="sticky top-0 text-right px-4 py-3 font-semibold bg-gray-100 border-b border-gray-200">In (msg/s)</th>
                                <th className="sticky top-0 text-right px-4 py-3 font-semibold bg-gray-100 border-b border-gray-200">Ack (msg/s)</th>
                                <th className="sticky top-0 text-center px-4 py-3 font-semibold bg-gray-100 border-b border-gray-200 last:rounded-tr-xl">Health</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c, i) => {
                                const hb = HEALTH_BADGE[c.healthStatus];
                                const rowBg = ROW_TINT[c.healthStatus] || zebraBase(i);
                                const isLast = i === filtered.length - 1;
                                return (
                                    <tr
                                        key={i}
                                        className={`group transition-colors hover:brightness-[0.97] ${ROW_BORDER[c.healthStatus]} ${rowBg}`}
                                    >
                                        <td className={`px-4 py-3 font-medium text-gray-800 whitespace-nowrap border-b ${isLast ? 'border-transparent' : 'border-gray-200'}`}>
                                            <Tooltip content={c.queueName} placement="right">
                                                <span className="cursor-help border-b border-dashed border-gray-300">
                                                    {c.name}
                                                </span>
                                            </Tooltip>
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap border-b ${isLast ? 'border-transparent' : 'border-gray-200'}`}>
                                            <span className="font-mono text-xs bg-white/80 border border-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                                {c.messageName}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-right border-b ${isLast ? 'border-transparent' : 'border-gray-200'}`}>
                                            <span className={`font-semibold ${c.totalNodes === 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                                {c.totalNodes}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-right text-gray-700 border-b ${isLast ? 'border-transparent' : 'border-gray-200'}`}>
                                            {c.queueCount}
                                        </td>
                                        <td className={`px-4 py-3 text-right text-gray-700 border-b ${isLast ? 'border-transparent' : 'border-gray-200'}`}>
                                            {c.processingCount}
                                        </td>
                                        <td className={`px-4 py-3 text-right border-b ${isLast ? 'border-transparent' : 'border-gray-200'}`}>
                                            <span className={c.retryCount > 0 ? 'font-medium text-amber-600' : 'text-gray-700'}>
                                                {c.retryCount}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-right border-b ${isLast ? 'border-transparent' : 'border-gray-200'}`}>
                                            <span className={c.failedCount > 0 ? 'font-bold text-red-600' : 'text-gray-700'}>
                                                {c.failedCount}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-mono text-xs text-gray-500 border-b ${isLast ? 'border-transparent' : 'border-gray-200'}`}>
                                            {c.incomingRate.toFixed(2)}
                                        </td>
                                        <td className={`px-4 py-3 text-right font-mono text-xs text-gray-500 border-b ${isLast ? 'border-transparent' : 'border-gray-200'}`}>
                                            {c.ackRate.toFixed(2)}
                                        </td>
                                        <td className={`px-4 py-3 border-b ${isLast ? 'border-transparent' : 'border-gray-200'}`}>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${hb.bg} ${hb.text}`}>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${hb.dot}`} />
                                                    {c.healthStatus}
                                                </div>
                                                {c.isBackpressured && (
                                                    <Tooltip content="Backpressure — queue depth exceeds threshold" placement="left">
                                                        <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium cursor-help">
                                                            BP
                                                        </span>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                            No consumers match the selected filter.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(ConsumerHealthTable);
