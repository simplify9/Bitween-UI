import {ISubscription, SubscriptionTypeOptions} from "../../types/subscriptions";
import {useNavigate} from "react-router-dom";
import {BsFillEyeFill} from "react-icons/bs";
import Button from "src/components/common/forms/Button";

interface Props {
    data: ISubscription[]
}

export const SubscriptionList: React.FC<Props> = ({data}) => {
    let navigate = useNavigate();
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
