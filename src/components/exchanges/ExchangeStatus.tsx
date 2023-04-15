import React from "react";

interface Props {
    status: boolean
    responseBad: boolean | null
    onClick: () => void

}


const ExchangeStatus: React.FC<Props> = ({status, onClick, responseBad}) => {

    
            
    return (
        <div onClick={onClick}>
            {
                responseBad ? <button type="button"
                                      className=" bg-yellow-50 text-yellow-500 hover:bg-yellow-100  focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-4 py-1.5 text-center mr-2 mb-2 ">
                        Bad Response
                    </button> :
                    status != null ?
                        status ?
                            <button type="button"
                                    className="t bg-green-50 text-green-500 hover:bg-green-200  focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center mr-2 mb-2 ">
                                Complete
                            </button>
                            : <button type="button"
                                      className="text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-1.5 text-center mr-2 mb-2 ">
                                Failed
                            </button>
                        : <button type="button"
                                  className="text-white bg-primary-500 hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-4 py-1.5 text-center mr-2 mb-2  ">
                            Running
                        </button>

            }

        </div>
    )
}

export default ExchangeStatus;

