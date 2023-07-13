import {
    ICreateSubscription,
    IDuplicateSubscription,
    ISubscription,
    SubscriptionTypeOptions
} from "../../types/subscriptions";
import {useNavigate} from "react-router-dom";
import {BsFillEyeFill} from "react-icons/bs";
import Button from "src/components/common/forms/Button";
import {IoCopy} from "react-icons/io5";
import React from "react";

interface Props {
    data: ISubscription[]
    handelDuplicate: (data: ISubscription) => void
}

export const SubscriptionList: React.FC<Props> = ({data, handelDuplicate}) => {
    const navigate = useNavigate();
    return (

        <table className="appearance-none min-w-full  ">
            <thead className="border-y bg-gray-50">
            <tr>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    ID
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    Name
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    Type
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    State
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    Status
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">

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
                            {SubscriptionTypeOptions.find(s => s.id == i.type)?.title}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            {i.isRunning ? "Running" : "Idle"}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            {i.inactive ? 'Inactive' : "Active"}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            <div className={"flex flex-row gap-3  text-primary-600"}>
                                <Button variant={"none"} onClick={() => navigate(`${i.id}`)}
                                >
                                    <BsFillEyeFill size={21}/>

                                </Button>
                                <Button variant={"none"} onClick={() => {
                                    handelDuplicate(i)
                                }}>
                                    <IoCopy/>
                                </Button>
                            </div>
                        </td>

                    </tr>
                ))

            }

            </tbody>
        </table>
    )
}
