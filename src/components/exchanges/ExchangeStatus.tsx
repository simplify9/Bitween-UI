import React from "react";
import Tooltip from "src/components/common/Tooltip";

interface Props {
    status: boolean
    responseBad: boolean | null

}


const ExchangeStatus: React.FC<Props> = ({status, responseBad}) => {

    
            
    return (
        <div>
            {
                responseBad ?
                    <Tooltip content="Delivered but the response was flagged as bad">
                        <div className=" bg-yellow-50 text-yellow-500 hover:bg-yellow-100  focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-4 py-1.5 text-center mr-2 mb-2 ">
                            Bad Response
                        </div>
                    </Tooltip> :
                    status != null ?
                        status ?
                            <Tooltip content="Delivered successfully">
                                <div className="t bg-green-50 text-green-500 hover:bg-green-200  focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center mr-2 mb-2 ">
                                    Complete
                                </div>
                            </Tooltip>
                            : <Tooltip content="Delivery failed — use the retry button to reprocess">
                                <div className="text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-1.5 text-center mr-2 mb-2 ">
                                    Failed
                                </div>
                            </Tooltip>
                        : <Tooltip content="Exchange is currently being processed">
                            <div className="text-white bg-primary-500 hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-4 py-1.5 text-center mr-2 mb-2  ">
                                Running
                            </div>
                        </Tooltip>
            }
        </div>
    )
}

export default ExchangeStatus;

