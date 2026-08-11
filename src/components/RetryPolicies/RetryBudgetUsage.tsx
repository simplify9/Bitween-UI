import React from "react";
import {useResetRetryPolicyUsageMutation, useRetryPolicyUsageQuery} from "src/client/apis/retryPoliciesApi";
import Button from "src/components/common/forms/Button";
import FormField from "src/components/common/forms/FormField";
import Authorize from "src/components/common/authorize/authorize";
import dayjs from "dayjs";

interface Props {
    policyId: number
}

// "Max attempts total" never resets on its own, so an integration that reaches its ceiling stops
// being retried until someone clears the counter here. Without this panel that state is invisible.
const RetryBudgetUsage: React.FC<Props> = ({policyId}) => {

    const {data, isLoading} = useRetryPolicyUsageQuery(policyId)
    const [reset] = useResetRetryPolicyUsageMutation()

    const rows = data ?? []
    const exhaustedCount = rows.filter(r => r.exhausted).length

    return (
        <FormField title="Budget usage"
                   tooltip="How much of each group's 'max attempts total' the integrations using this policy have spent. The total never resets on its own — clear it here to let a group retry again.">
            <p className={"text-xs text-gray-500 mb-2"}>
                Counted separately for each integration. Integrations that have never failed under this
                policy do not appear.
            </p>

            {isLoading && <p className={"text-sm text-gray-400 italic px-2 py-3"}>Loading…</p>}

            {!isLoading && rows.length === 0 &&
                <p className={"text-sm text-gray-400 italic px-2 py-3"}>
                    No budget spent — every group has its full allowance.
                </p>}

            {rows.length > 0 && <div className={"flex flex-col gap-2"}>
                {exhaustedCount > 0 &&
                    <p className={"text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2"}>
                        {exhaustedCount === 1
                            ? "1 integration has exhausted its budget and is no longer being retried."
                            : `${exhaustedCount} integrations have exhausted their budget and are no longer being retried.`}
                    </p>}

                <table className="appearance-none min-w-full">
                    <thead className="border-y bg-gray-50">
                    <tr>
                        <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Integration</th>
                        <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Group</th>
                        <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Used</th>
                        <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Last retry</th>
                        <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((r) => (
                        <tr key={`${r.subscriptionId}-${r.groupId}`} className="bg-white border-b">
                            <td className="text-sm text-gray-900 font-semibold px-6 py-4 whitespace-nowrap">
                                {r.subscriptionName}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                {r.groupName}
                            </td>
                            <td className="text-sm px-6 py-4 whitespace-nowrap">
                                <span className={r.exhausted ? "text-red-600 font-semibold" : "text-gray-900"}>
                                    {r.attemptsUsed} / {r.maxAttemptsTotal}
                                </span>
                                {r.exhausted &&
                                    <span className={"ml-2 inline-block bg-red-100 text-red-700 rounded px-2 py-0.5 text-xs"}>
                                        Exhausted
                                    </span>}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                {dayjs(r.lastAttemptOn).format("YYYY-MM-DD HH:mm")}
                            </td>
                            <td className={"px-6 py-4"}>
                                <Authorize roles={["Admin", "Member"]}>
                                    <Button variant={"secondary"}
                                            onClick={() => reset({
                                                id: policyId,
                                                subscriptionId: r.subscriptionId,
                                                groupId: r.groupId
                                            })}>
                                        Reset
                                    </Button>
                                </Authorize>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <Authorize roles={["Admin", "Member"]}>
                    <div className={"flex flex-row-reverse"}>
                        <Button variant={"secondary"} onClick={() => reset({id: policyId})}>
                            Reset all
                        </Button>
                    </div>
                </Authorize>
            </div>}
        </FormField>
    );
}

export default RetryBudgetUsage;
