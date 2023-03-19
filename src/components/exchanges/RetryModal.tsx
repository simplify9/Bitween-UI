import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";
import Modal from "src/components/common/Modal";
import React, {useState} from "react";
import {apiClient} from "src/client";
import Button from "src/components/common/forms/Button";

type Props = {
    exception?: string
    onClose: () => void
    xid?: string
}
const RetryModal: React.FC<Props> = ({exception, onClose, xid}) => {

    const [resetForRetry, setResetForRetry] = useState<boolean>(false);

    const onRetry = async () => {

        if (xid) {
            let res = await apiClient.retryExchanges(xid, resetForRetry);
            if (res.succeeded) {
                onClose();
            }
            return;
        }


    }
    return (<Modal
        onClose={onClose}
        extraFooterComponents={
            <div className={"flex align-middle justify-between items-center gap-5"}>

                <Button onClick={() => onRetry()}>
                    Retry
                </Button>

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