// Dialog.js
import React from 'react';
import Button from "src/components/common/forms/Button";

type Props = {
    title: string
    onConfirm: () => void
    onCancel: () => void

}
const Dialog: React.FC<Props> = ({title, onConfirm, onCancel}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-50 fixed inset-0"></div>
            <div
                className="bg-white  rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full p-6">
                <h2 className="text-lg font-semibold mb-8">{title}</h2>
                <div className="flex  justify-between space-x-24  ">

                    <Button
                        variant={"secondary"}
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Dialog;