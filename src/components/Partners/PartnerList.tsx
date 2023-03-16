import {IPartner} from "../../types/partners";
import {useNavigate} from "react-router-dom";
import Button from "src/components/common/forms/Button";
import {BsFillEyeFill} from "react-icons/bs";

interface Props {
    data: IPartner[]
}

export const PartnerList: React.FC<Props> = ({data}) => {

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
                    Keys
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    Subscriptions
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
                            {i.keys ?? "0"}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                            {i.subscriptionsCount ?? "0"}
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
