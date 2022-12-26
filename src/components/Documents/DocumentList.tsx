import {IDocument} from "../../types/document";
import {useNavigate} from "react-router-dom";
import {BsFillEyeFill} from "react-icons/bs"

interface Props {
    data: IDocument[]
}

export const DocumentList: React.FC<Props> = ({data}) => {
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
                    Bus Enabled
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    Bus Message Type Name
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">

                </th>

            </tr>
            </thead>
            <tbody>
            {
                data.map((i) => (
                    <tr key={i.id} className="bg-white border-b">
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                            {i.id}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                            {i.name}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                            {i.busEnabled ? "True" : "False"}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                            {i.busMessageTypeName}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                            <button onClick={() => navigate(`${i.id}`)} type="button"
                                    className="text-white bg-teal-600 focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm  px-4 py-2 text-center inline-flex items-center  mr-2 mb-2">
                                <BsFillEyeFill size={21}/>
                            </button>

                        </td>

                    </tr>
                ))

            }

            </tbody>
        </table>
    )
}
