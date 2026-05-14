import React from 'react';
import { DashboardAlert, AlertSeverity } from 'src/types/amqpHealth';
import dayjs from 'dayjs';
import { TbAlertCircle, TbAlertTriangle, TbInfoCircle } from 'react-icons/tb';

interface Props {
    alerts: DashboardAlert[];
}

const severityConfig: Record<AlertSeverity, {
    border: string;
    bg: string;
    icon: React.ReactNode;
    badge: string;
    accentBar: string;
}> = {
    Critical: {
        border: 'border-l-red-500',
        bg: 'bg-red-50',
        accentBar: 'bg-red-500',
        icon: <TbAlertCircle className="text-red-500 shrink-0" size={20} />,
        badge: 'bg-red-100 text-red-700',
    },
    Warning: {
        border: 'border-l-amber-400',
        bg: 'bg-amber-50',
        accentBar: 'bg-amber-400',
        icon: <TbAlertTriangle className="text-amber-500 shrink-0" size={20} />,
        badge: 'bg-amber-100 text-amber-700',
    },
    Info: {
        border: 'border-l-blue-400',
        bg: 'bg-blue-50',
        accentBar: 'bg-blue-400',
        icon: <TbInfoCircle className="text-blue-500 shrink-0" size={20} />,
        badge: 'bg-blue-100 text-blue-700',
    },
};

const AlertsPanel: React.FC<Props> = ({ alerts }) => {
    if (alerts.length === 0) return null;

    const criticalCount = alerts.filter(a => a.severity === 'Critical').length;

    return (
        <div className="flex flex-col gap-2">
            {/* Section header */}
            <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-red-500 rounded-full" />
                <h3 className="text-sm font-semibold text-gray-700">Active Alerts</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    criticalCount > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                    {alerts.length}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                {alerts.map((alert, i) => {
                    const cfg = severityConfig[alert.severity];
                    return (
                        <div
                            key={i}
                            className={`flex items-start gap-3 rounded-xl border-l-4 px-4 py-3.5 shadow-sm ${cfg.border} ${cfg.bg}`}
                        >
                            {cfg.icon}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-gray-800">{alert.title}</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                                        {alert.severity}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{alert.detail}</p>
                                <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                                    {alert.consumerName && (
                                        <span>
                                            Consumer:{' '}
                                            <span className="font-medium text-gray-600">{alert.consumerName}</span>
                                        </span>
                                    )}
                                    {alert.queueName && (
                                        <span>
                                            Queue:{' '}
                                            <span className="font-mono text-gray-500">{alert.queueName}</span>
                                        </span>
                                    )}
                                    <span className="ml-auto">{dayjs(alert.timestampUtc).format('HH:mm:ss')}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(AlertsPanel);
