import {useNavigate} from "react-router-dom";
import React from "react";
import {NotifierModel} from "src/types/notifiers";
import {BsFillEyeFill} from "react-icons/bs";
import Button from "src/components/common/forms/Button";

interface Props {
    data: NotifierModel[]
}

export const NotifiersList: React.FC<Props> = ({data}) => {

    let navigate = useNavigate();

    return (
        <table className="appearance-none min-w-full">
            <thead className="border-y bg-gray-50">
            <tr>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    ID
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    Name
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    HandlerId
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    On Success
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    On Bad Result
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    On Bad Failure
                </th>
            </tr>
            </thead>
            <tbody>
            {
                data.map((i) => (
                    <tr key={i.id} className="bg-white border-b">
                        <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            {i.id}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            {i.name}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            {i.handlerId}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            {i.runOnSuccessfulResult ? 'True' : 'False'}
                        </td>
                        <td className="text-sm  text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            {i.runOnBadResult ? 'True' : 'False'}
                        </td>
                        <td className="text-sm  text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            {i.runOnFailedResult ? 'True' : 'False'}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            {i.inactive}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            <Button variant={"none"} onClick={() => navigate(`${i.id}`)}
                            >
                                <BsFillEyeFill className={"text-primary-600"} size={21}/>

                            </Button>
                        </td>
                    </tr>
                ))

            }

            </tbody>
        </table>
    )
}
