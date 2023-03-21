import Button from "./forms/Button";
import {classes} from "./forms/utils";
import React from "react";


type Props = JSX.IntrinsicElements['div'] & {
    onClose: () => void
    onSubmit?: () => void
    submitLabel?: string
    submitDisabled?: boolean
    extraFooterComponents?: React.ReactElement
    bodyContainerClasses?: string
}


const Component: React.FC<Props> = ({
                                        onClose,
                                        onSubmit,
                                        submitLabel,
                                        submitDisabled,
                                        extraFooterComponents,
                                        className,
                                        children,
                                        bodyContainerClasses
                                    }) => {

    return (
        <div className="absolute " style={{zIndex: 500000000000}}>

            <div className={classes("relative z-50 overflow-scroll ", className || "")}
                 aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                <div className="fixed z-10 inset-0 overflow-scroll">
                    <div
                        className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">

                        <div
                            className="relative flex flex-col justify-between min-h-[500px] h-auto grow bg-white rounded-lg text-left overflow-scroll overflow-y-auto  shadow-xl transform transition-all  sm:max-w-screen-lg sm:w-full">
                            <div
                                className={classes("sm:items-start px-4 pt-5 pb-4 sm:p-3 sm:pb-2 h-100 overflow-y-visible ", bodyContainerClasses)}>
                                {children}
                            </div>
                            <div
                                className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ">

                                <div>
                                    {onSubmit && <Button disabled={submitDisabled} onClick={() => {
                                        onSubmit()
                                    }}
                                    >{submitLabel ?? "Save"}
                                    </Button>}
                                </div>
                              
                                <div>
                                    
                                    <Button onClick={onClose}
                                            variant={"secondary"}
                                    >
                                        Cancel
                                    </Button>
                                </div>

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
