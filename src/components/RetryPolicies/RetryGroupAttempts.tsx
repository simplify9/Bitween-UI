import React from "react";
import {NavLink} from "react-router-dom";
import dayjs from "dayjs";
import {useRetryPolicyAttemptsQuery} from "src/client/apis/retryPoliciesApi";
import {RetryGroupAttemptRow} from "src/types/retryPolicies";
import Button from "src/components/common/forms/Button";

interface Props {
    policyId: number
    subscriptionId: number
    groupId: string
}

// The failures behind one row's spent budget. Mounted only while its row is open, which is what
// makes the fetch lazy — no policy loads more of these than the reader actually asked to see.

// Exceptions arrive whole, stack trace and all. The message is the first line; the rest is left to
// the title attribute and to the exchange itself.
const oneLine = (text?: string | null) => {
    const first = (text ?? "").split("\n")[0].trim()
    return first || "No error text recorded"
}

const Attempt: React.FC<{ attempt: RetryGroupAttemptRow }> = ({attempt}) => (
    <div className={"flex flex-row items-baseline gap-3 py-[3px]"}>
        <span className={"text-gray-500 w-[130px] shrink-0"}>
            {dayjs(attempt.failedOn).format("YYYY-MM-DD HH:mm:ss")}
        </span>
        {/* Counted from 1 for the first delivery, matching what the Test policy dialog shows —
            the stored number is the retry chain's depth, which starts at 0. */}
        <span className={"text-gray-500 w-[28px] shrink-0"}>
            {attempt.attemptNumber != null ? `#${attempt.attemptNumber + 1}` : "—"}
        </span>
        <span className={"text-gray-700 truncate grow"} title={attempt.exception ?? undefined}>
            {oneLine(attempt.exception)}
        </span>
        {attempt.retryBlockedReason &&
            <span className={"text-amber-700 truncate max-w-[180px] shrink-0"}
                  title={attempt.retryBlockedReason}>
                {attempt.retryBlockedReason}
            </span>}
        <NavLink to={`/Xchanges?id=${encodeURIComponent(attempt.xchangeId)}`}
                 className={"text-primary-600 hover:underline shrink-0"}>
            Open
        </NavLink>
    </div>
)

const RetryGroupAttempts: React.FC<Props> = ({policyId, subscriptionId, groupId}) => {

    const {data, isLoading, isError, refetch} =
        useRetryPolicyAttemptsQuery({id: policyId, subscriptionId, groupId})

    if (isLoading)
        return <p className={"text-gray-400 italic py-1"}>Loading failures…</p>

    if (isError)
        return (
            <div className={"flex flex-row items-center gap-3 text-red-700"}>
                <span>Could not load this pair's failures.</span>
                <Button variant={"none"} className={"text-primary-600 hover:underline"}
                        onClick={() => refetch()}>
                    Try again
                </Button>
            </div>
        )

    const attempts = data?.attempts ?? []

    // One message covers all three ways of getting here — never failed, failed only before
    // attempts were tracked, or reset since (a reset drops the counter row, not the failures). An
    // empty box on its own would read as a bug.
    if (attempts.length === 0)
        return (
            <p className={"text-gray-500 py-1"}>
                No failures recorded against this group for this subscription. Failures from before
                retry attempts were tracked are not listed here.
            </p>
        )

    const pending = attempts.filter(a => a.retryPending)
    const stopped = attempts.filter(a => !a.retryPending)

    return (
        <div className={"flex flex-col gap-2 py-1"}>
            {/* Still moving first: these are the ones an operator can still affect. The server
                orders them first too, so the cap can never drop them. */}
            {pending.length > 0 &&
                <div>
                    <p className={"font-semibold text-gray-900 mb-0.5"}>
                        Retrying now
                        <span className={"ml-1.5 text-gray-400 font-normal"}>{pending.length}</span>
                    </p>
                    {pending.map(a => <Attempt key={a.xchangeId} attempt={a}/>)}
                </div>}

            {stopped.length > 0 &&
                <div>
                    <p className={"font-semibold text-gray-900 mb-0.5"}>
                        Stopped
                        <span className={"ml-1.5 text-gray-400 font-normal"}>{stopped.length}</span>
                    </p>
                    {stopped.map(a => <Attempt key={a.xchangeId} attempt={a}/>)}
                </div>}

            {/* Only when there is more than is shown: a count that always appears reads as noise,
                and the total counts every failure ever, not what the budget currently says. */}
            {data && data.total > attempts.length &&
                <p className={"text-gray-500"}>
                    Showing the latest {attempts.length} of {data.total} failures.
                </p>}
        </div>
    )
}

export default RetryGroupAttempts;
