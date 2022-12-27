import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";
import Modal from "src/components/common/Modal";
import React, {useState} from "react";
import {apiClient} from "src/client";

type Props = {
    onClose: () => void
    xids?: string[]
    onRefresh: () => void
}
const RetryModal: React.FC<Props> = ({onClose, xids,onRefresh}) => {

    const [resetForRetry, setResetForRetry] = useState<boolean>(false);

    const onRetry = async () => {
        if (xids) {
            let res = await apiClient.bulkRetryExchanges(xids, resetForRetry);
            if (res.succeeded) {
                onRefresh()
                onClose();
            }
        }
    }

    return (
        <Modal
            onClose={onClose}
            extraFooterComponents={
                <div className={"flex align-middle justify-between items-center gap-5"}>

                    <button onClick={() => onRetry()}
                            className="block appearance-none border bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded drop-shadow-sm focus:drop-shadow-lg focus:outline-none">
                        Retry
                    </button>

                </div>}
        >
            <div className={"flex flex-row justify-between"}>
                <h3 className={""}>
                    Retry {xids?.length} xChanges
                </h3>
                <CheckBoxEditor className={"items-center"} onChange={setResetForRetry}
                                label={"Reset Configuration"}
                                checked={resetForRetry}/>
            </div>
        </Modal>)
}

export default RetryModal