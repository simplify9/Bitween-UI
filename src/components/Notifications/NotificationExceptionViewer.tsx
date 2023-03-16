import Modal from "src/components/common/Modal";
import React from "react";

type Props = {
    onClose: () => void
    exception: string
}
const NotificationExceptionViewer: React.FC<Props> = ({onClose, exception}) => {
    return <Modal
        onClose={onClose}
    >
        <div className="flex gap-2 flex-col py-1 border bg-gray-50 px-2 align-center rounded shadow-sm  ">
            <div className={"min-h-[50px]"}>
                {exception?.split("{{newline}}").map((d, i) => <p key={i}>{d}</p>)}
            </div>
        </div>
    </Modal>
}
export default NotificationExceptionViewer