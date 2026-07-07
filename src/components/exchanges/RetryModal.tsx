import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";
import Modal from "src/components/common/Modal";
import React, {useState} from "react";
import {apiClient} from "src/client";
import Button from "src/components/common/forms/Button";
import {useRunDelayedRetryNowMutation} from "src/client/apis/delayedRetriesApi";
import dayjs from "dayjs";

type Props = {
    exception?: string
    onClose: () => void
    xid?: string
    scheduledRetryOn?: string | null
    onRefresh?: () => void
}
const RetryModal: React.FC<Props> = ({exception, onClose, xid, scheduledRetryOn, onRefresh}) => {

    const [resetForRetry, setResetForRetry] = useState<boolean>(false);
    const [runNow] = useRunDelayedRetryNowMutation();
    const hasScheduledRetry = Boolean(scheduledRetryOn);

    const onRetry = async () => {

        if (xid) {
            let res = await apiClient.retryExchanges(xid, resetForRetry);
            if (res.succeeded) {
                onClose();
            }
            return;
        }


    }

    const onRunNow = async () => {
        if (xid) {
            const res = await runNow(xid);
            if (!('error' in res)) {
                onRefresh?.();
                onClose();
            }
        }
    }
    return (<Modal
        onClose={onClose}
        extraFooterComponents={
            <div className={"flex align-middle justify-between items-center gap-5"}>
                {xid && hasScheduledRetry && <Button onClick={() => onRunNow()}>
                    Run Now
                </Button>}
                {xid && <Button onClick={() => onRetry()} disabled={hasScheduledRetry}>
                    Retry
                </Button>}


            </div>}
    >
        <div className={"flex flex-row justify-between"}>
            <h3 className={""}>
                Retry xChange
            </h3>

            <CheckBoxEditor className={"items-center"} onChange={setResetForRetry}
                            label={"Reset Configuration"}
                            checked={resetForRetry}/>
        </div>
        {
            hasScheduledRetry &&
            <div className="flex gap-2 flex-col py-2 border border-blue-200 bg-blue-50 px-2 align-center rounded shadow-sm mb-2">
                An auto-retry is already scheduled for {dayjs(scheduledRetryOn).format("YYYY-MM-DD HH:mm:ss")}.
                Use "Run Now" to execute it immediately, or wait for it to run automatically.
            </div>
        }
        {
            exception &&
            <div className="flex gap-2 flex-col py-1 border bg-gray-50 px-2 align-center rounded shadow-sm  ">

                <div className={"min-h-[50px]"}>
                    {exception?.split("{{newline}}").map((d, i) => <p key={i}>{d}</p>)}
                </div>

            </div>
        }

    </Modal>)
}

export default RetryModal