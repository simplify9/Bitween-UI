import React from 'react';
import { DeadLetterSummaryView, AlertSeverity } from 'src/types/amqpHealth';
import Tooltip from 'src/components/common/Tooltip';
import dayjs from 'dayjs';
import { TbCircleCheck } from 'react-icons/tb';

interface Props {
    deadLetters: DeadLetterSummaryView[];
}

const SEVERITY_BADGE: Record<AlertSeverity, string> = {
    Info:     'bg-green-100 text-green-700',
    Warning:  'bg-amber-100 text-amber-700',
    Critical: 'bg-red-100 text-red-700',
};

const DeadLetterTable: React.FC<Props> = ({ deadLetters }) => {
    return (
        <div className="flex flex-col gap-2">
            {/* Section header */}
            <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-red-500 rounded-full" />
                <h3 className="text-sm font-semibold text-gray-700">Dead Letters</h3>
                {deadLetters.length > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        {deadLetters.length}
                    </span>
                )}
            </div>

            {deadLetters.length === 0 ? (
                <div className="flex items-center justify-center gap-2 bg-white rounded-xl shadow-sm py-10 text-sm text-green-600">
                    <TbCircleCheck className="text-green-400" size={18} />
                    No dead-letter accumulations
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                                <th className="text-left px-4 py-3 font-semibold">Consumer</th>
                                <th className="text-left px-4 py-3 font-semibold">Message</th>
                                <th className="text-right px-4 py-3 font-semibold">DL Count</th>
                                <th className="text-left px-4 py-3 font-semibold">Last Exception</th>
                                <th className="text-left px-4 py-3 font-semibold">Last Failed</th>
                                <th className="text-center px-4 py-3 font-semibold">Severity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {deadLetters.map((dl, i) => {
                                const exceptionMsg = dl.lastExceptionMessage ?? '';
                                const truncated = exceptionMsg.length > 55
                                    ? exceptionMsg.slice(0, 55) + '…'
                                    : exceptionMsg;

                                return (
                                    <tr key={i} className="hover:bg-red-50/40 transition-colors border-l-4 border-l-red-400">
                                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{dl.consumerName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {dl.messageName}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-red-600">
                                            {dl.deadLetterCount}
                                        </td>
                                        <td className="px-4 py-3 max-w-[200px]">
                                            {exceptionMsg ? (
                                                <Tooltip content={exceptionMsg} placement="top">
                                                    <div className="cursor-help space-y-0.5">
                                                        {dl.lastExceptionType && (
                                                            <div className="font-mono text-xs text-red-500 truncate">
                                                                {dl.lastExceptionType}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-500 truncate">{truncated}</div>
                                                    </div>
                                                </Tooltip>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {dl.lastFailedAt
                                                ? dayjs(dl.lastFailedAt).format('MMM D, HH:mm:ss')
                                                : <span className="text-gray-300">—</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEVERITY_BADGE[dl.severity]}`}>
                                                {dl.severity}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default React.memo(DeadLetterTable);
