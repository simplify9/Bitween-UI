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
                                      className="text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm px-4 py-1.5 text-center mr-2 mb-2 ">
                        Bad Response
                    </button> :
                    status != null ?
                        status ?
                            <button type="button"
                                    className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-3 py-1.5 text-center mr-2 mb-2 ">
                                Suscces
                            </button>
                            : <button type="button"
                                      className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-4 py-1.5 text-center mr-2 mb-2 ">Failed</button>
                        : <button type="button"
                                  className="text-white bg-blue-500 hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200 font-medium rounded-full text-sm px-4 py-1.5 text-center mr-2 mb-2  ">
                            Running
                        </button>

            }

        </div>
    )
}

export default ExchangeStatus;

