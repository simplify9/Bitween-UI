import React from 'react';
import { RetryAnalysisView, AlertSeverity } from 'src/types/amqpHealth';
import { TbCircleCheck } from 'react-icons/tb';

interface Props {
    retries: RetryAnalysisView[];
}

const SEVERITY_BADGE: Record<AlertSeverity, string> = {
    Info:     'bg-green-100 text-green-700',
    Warning:  'bg-amber-100 text-amber-700',
    Critical: 'bg-red-100 text-red-700',
};

const BACKLOG_BAR: Record<AlertSeverity, string> = {
    Info:     'bg-green-400',
    Warning:  'bg-amber-400',
    Critical: 'bg-red-500',
};

const RetryAnalysisTable: React.FC<Props> = ({ retries }) => {
    const maxBacklog = Math.max(...retries.map(r => r.retryBacklog), 1);

    return (
        <div className="flex flex-col gap-2">
            {/* Section header */}
            <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-amber-400 rounded-full" />
                <h3 className="text-sm font-semibold text-gray-700">Retry Analysis</h3>
                {retries.length > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        {retries.length}
                    </span>
                )}
            </div>

            {retries.length === 0 ? (
                <div className="flex items-center justify-center gap-2 bg-white rounded-xl shadow-sm py-10 text-sm text-green-600">
                    <TbCircleCheck className="text-green-400" size={18} />
                    No retry backlogs
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                                <th className="text-left px-4 py-3 font-semibold">Consumer</th>
                                <th className="text-left px-4 py-3 font-semibold">Message</th>
                                <th className="text-left px-4 py-3 font-semibold">Backlog</th>
                                <th className="text-right px-4 py-3 font-semibold">In (msg/s)</th>
                                <th className="text-right px-4 py-3 font-semibold">Ack (msg/s)</th>
                                <th className="text-center px-4 py-3 font-semibold">Severity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {retries.map((r, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{r.consumerName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                            {r.messageName}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[48px]">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all ${BACKLOG_BAR[r.severity]}`}
                                                    style={{ width: `${Math.max(4, Math.round((r.retryBacklog / maxBacklog) * 100))}%` }}
                                                />
                                            </div>
                                            <span className={`font-bold text-sm min-w-[2ch] text-right ${
                                                r.severity === 'Critical' ? 'text-red-600' : 'text-amber-600'
                                            }`}>
                                                {r.retryBacklog}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">{r.incomingRate.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">{r.ackRate.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEVERITY_BADGE[r.severity]}`}>
                                            {r.severity}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default React.memo(RetryAnalysisTable);
