import React, {useState} from "react";
import Modal from "src/components/common/Modal";
import FormField from "src/components/common/forms/FormField";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import Button from "src/components/common/forms/Button";
import {useTestRetryPolicyMutation} from "src/client/apis/retryPoliciesApi";
import {RetryGroup, resultTypeOptions, TestRetryAttemptResult, XchangeResultType} from "src/types/retryPolicies";
import {OptionType} from "src/types/common";
import {MdCheckCircle, MdCancel, MdPlayCircleOutline} from "react-icons/md";

type Props = {
    groups: RetryGroup[]
    onClose: () => void
}

const CONTENT_PLACEHOLDERS: Record<string, string> = {
    [XchangeResultType.Error]: "Paste an exception message or stack trace, e.g.:\nSystem.TimeoutException: The operation has timed out.",
    [XchangeResultType.BadResult]: "Paste the raw JSON response body, e.g.:\n{\"status\":\"FAILED\",\"errors\":[{\"code\":500}]}",
}

const TestRetryPolicyModal: React.FC<Props> = ({groups, onClose}) => {

    const [resultType, setResultType] = useState<XchangeResultType>(XchangeResultType.Error);
    const [content, setContent] = useState("");
    const [attemptsToSimulate, setAttemptsToSimulate] = useState(5);
    const [runTest, testResult] = useTestRetryPolicyMutation();

    const onRunTest = () => {
        runTest({
            groups,
            resultType: resultType as XchangeResultType.Error | XchangeResultType.BadResult,
            content,
            attemptsToSimulate,
        });
    }

    const attempts = testResult.data?.attempts ?? [];
    const firstAttempt = attempts[0];

    return (
        <Modal onClose={onClose} bodyContainerClasses="min-h-0">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Test this policy</h3>
            <p className="text-sm text-gray-500 mb-4">
                Simulates a failure against the groups currently shown below — including any unsaved
                edits — without touching real data. Nothing here is persisted.
            </p>

            <div className="flex flex-row gap-5">
                <FormField title="Result type" tooltip="Which kind of failure to simulate." className="w-48">
                    <ChoiceEditor
                        value={resultType}
                        onChange={(v) => setResultType(v as XchangeResultType)}
                        options={resultTypeOptions}
                        optionTitle={(o: OptionType) => o.title}
                        optionValue={(o: OptionType) => o.id}
                        isClearable={false}
                    />
                </FormField>
                <FormField title="Attempts to simulate"
                           tooltip="How many consecutive failures of this exact message to simulate — shows what happens on the 1st, 2nd, 3rd… attempt until a retry budget blocks it."
                           className="w-48">
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={attemptsToSimulate}
                        onChange={(e) => setAttemptsToSimulate(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                </FormField>
            </div>

            <FormField
                title={resultType === XchangeResultType.Error ? "Exception text" : "Response body (JSON)"}
                tooltip={resultType === XchangeResultType.Error
                    ? "The exception message/stack-trace text your matchers will be checked against."
                    : "The raw JSON response body your JSON path matchers will be checked against."}
                className="grow mt-3"
            >
                <textarea
                    value={content}
                    placeholder={CONTENT_PLACEHOLDERS[resultType]}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-400 resize-y"
                />
            </FormField>

            <div className="flex flex-row justify-end mt-3">
                <Button onClick={onRunTest} disabled={!content || testResult.isLoading}>
                    <span className="inline-flex items-center gap-1.5">
                        <MdPlayCircleOutline size={18}/>
                        {testResult.isLoading ? "Running…" : "Run test"}
                    </span>
                </Button>
            </div>

            {attempts.length > 0 && firstAttempt && (
                <div className="mt-5 border-t pt-4">
                    {/* Headline — the single most important answer, front and center */}
                    <div className={
                        "rounded-lg px-4 py-3 flex items-center gap-3 " +
                        (firstAttempt.shouldRetry ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800")
                    }>
                        {firstAttempt.shouldRetry
                            ? <MdCheckCircle size={28} className="text-green-500 flex-shrink-0"/>
                            : <MdCancel size={28} className="text-red-500 flex-shrink-0"/>}
                        <div>
                            <div className="font-bold">
                                {firstAttempt.shouldRetry
                                    ? `Will retry in ${formatSeconds(firstAttempt.delaySeconds)}`
                                    : "Won't retry"}
                            </div>
                            <div className="text-sm opacity-80">
                                {firstAttempt.matchedGroupName
                                    ? `Matched group "${firstAttempt.matchedGroupName}"`
                                    : firstAttempt.reason}
                            </div>
                        </div>
                    </div>

                    {/* Full attempt-by-attempt timeline */}
                    {attempts.length > 1 && (
                        <div className="mt-4 flex flex-col">
                            {attempts.map((attempt, i) => (
                                <AttemptRow key={attempt.attemptNumber} attempt={attempt} isLast={i === attempts.length - 1}/>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}

const formatSeconds = (seconds?: number | null): string => {
    if (seconds === undefined || seconds === null) return "";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.round(seconds % 60);
    return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

const AttemptRow: React.FC<{ attempt: TestRetryAttemptResult, isLast: boolean }> = ({attempt, isLast}) => (
    <div className="flex flex-row gap-3">
        <div className="flex flex-col items-center">
            <div className={
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 " +
                (attempt.shouldRetry ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")
            }>
                {attempt.attemptNumber}
            </div>
            {!isLast && <div className="w-px grow bg-gray-200 my-0.5"/>}
        </div>
        <div className="pb-4">
            <div className="text-sm font-semibold text-gray-800">
                {attempt.shouldRetry
                    ? `Retry scheduled — wait ${formatSeconds(attempt.delaySeconds)}`
                    : "Blocked — no further attempts"}
            </div>
            <div className="text-xs text-gray-500">
                {attempt.matchedGroupName && <span className="font-medium">"{attempt.matchedGroupName}"</span>}
                {attempt.matchedGroupName && " — "}
                {attempt.reason}
            </div>
        </div>
    </div>
);

export default TestRetryPolicyModal;
