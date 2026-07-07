import React, {useState} from "react";
import {NavLink} from "react-router-dom";
import dayjs from "dayjs";
import {DelayedRetryRow} from "src/types/delayedRetries";
import {useRunDelayedRetryNowMutation} from "src/client/apis/delayedRetriesApi";
import Button from "src/components/common/forms/Button";
import Dialog from "src/components/common/dialog";
import Authorize from "src/components/common/authorize/authorize";
import Tooltip from "src/components/common/Tooltip";

interface Props {
    data: DelayedRetryRow[];
}

export const ScheduledRetriesList: React.FC<Props> = ({data}) => {

    const [runNow] = useRunDelayedRetryNowMutation();
    const [pendingRunNowId, setPendingRunNowId] = useState<string | null>(null);

    const onConfirmRunNow = async () => {
        if (pendingRunNowId) {
            await runNow(pendingRunNowId);
            setPendingRunNowId(null);
        }
    }

    return (
        <>
            {pendingRunNowId && (
                <Dialog
                    onCancel={() => setPendingRunNowId(null)}
                    onConfirm={onConfirmRunNow}
                    title={`Run the scheduled auto-retry for exchange "${pendingRunNowId}" now?`}
                />
            )}
            <table className="appearance-none min-w-full">
                <thead className="border-y bg-gray-50">
                <tr>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Exchange</th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Document</th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Subscription</th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Scheduled On</th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Exception</th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Actions</th>
                </tr>
                </thead>
                <tbody>
                {
                    data?.map(i => (
                        <tr key={i.id} className="bg-white border-b transition duration-300 ease-in-out">
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap max-w-[160px] truncate">
                                {i.id}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                <NavLink to={`/documents/${i.documentId}`} className={"text-primary-600 hover:underline"}>
                                    {i.documentName}
                                </NavLink>
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.subscriptionId
                                    ? <NavLink to={`/subscriptions/${i.subscriptionId}`} className={"text-primary-600 hover:underline"}>
                                        {i.subscriptionName}
                                    </NavLink>
                                    : "-"}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {dayjs(i.on).format("YYYY-MM-DD HH:mm:ss")}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 max-w-[240px] truncate">
                                <Tooltip content={i.exception ?? ""} placement="top">
                                    <span>{i.exception ?? "-"}</span>
                                </Tooltip>
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                <Authorize roles={["Admin", "Member"]}>
                                    <Button variant={"secondary"} onClick={() => setPendingRunNowId(i.id)}>
                                        Run Now
                                    </Button>
                                </Authorize>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        </>
    )
}
