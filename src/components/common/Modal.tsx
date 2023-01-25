import Button from "./forms/Button";
import {classes} from "./forms/utils";
import React from "react";


type Props = JSX.IntrinsicElements['div'] & {
    onClose: () => void
    onSubmit?: () => void
    submitLabel?: string
    submitDisabled?: boolean
    extraFooterComponents?: any
}


const Component: React.FC<Props> = ({
                                        onClose,
                                        onSubmit,
                                        submitLabel,
                                        submitDisabled,
                                        extraFooterComponents,
                                        className,
                                        children
                                    }) => {

    return (
        <div className="absolute  z-50">

            <div className={classes("relative z-50 overflow-scroll", className || "")}
                 aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div
                        className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">

                        <div
                            className="relative  bg-white rounded-lg text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:max-w-screen-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:items-start overflow-visible">
                                    {children}
                                </div>
                            </div>
                            <div
                                className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">

                                {onSubmit && <Button disabled={submitDisabled} onClick={onSubmit}
                                                     type="button"
                                                     className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm">{submitLabel ?? "Save"}
                                </Button>}
                                <Button onClick={onClose} type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel
                                </Button>
                                {extraFooterComponents}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Component;
