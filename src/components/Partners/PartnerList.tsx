import {IPartner} from "../../types/partners";
import {useNavigate} from "react-router-dom";

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
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                            {i.id}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                            {i.name}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                            {i.keys ?? "0"}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                            {i.subscriptionsCount ?? "0"}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                            <button onClick={() => navigate(`${i.id}`)} type="button" className="text-white bg-blue-900 focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-3 py-2.5 text-center inline-flex items-center  mr-2 mb-2">
                                <svg id="Layer_1" className="w-5 h-100" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 68.3">
                                    <path fill="currentColor" d="M1.1,31.27A106.12,106.12,0,0,1,11.39,20.42C25.76,7.34,42.08.36,59,0S93,5.93,109.29,19.32a121.64,121.64,0,0,1,12.53,12,4.08,4.08,0,0,1,.25,5.18,80.29,80.29,0,0,1-15.36,16.4q-2.14,1.71-4.37,3.23l-5.73-6c1.71-1.11,3.39-2.33,5-3.64a70.31,70.31,0,0,0,11.88-12.15,112.51,112.51,0,0,0-9.39-8.75C89.44,13.5,74,7.83,59.12,8.14S29.77,14.71,16.87,26.45a96.58,96.58,0,0,0-7.48,7.63A80.69,80.69,0,0,0,23.88,47.29,67.91,67.91,0,0,0,63.4,60.17c1,0,2.07,0,3.1-.09l7.18,7.41a70.35,70.35,0,0,1-10.25.81A76,76,0,0,1,19.19,54,89.55,89.55,0,0,1,.88,36.58a4.07,4.07,0,0,1,.22-5.31ZM62.8,11.91a22,22,0,0,1,21,28.22,21.56,21.56,0,0,1-2.23,5L94.33,58.67a1,1,0,0,1-.06,1.48L88,65.85a1,1,0,0,1-1.48-.07L74.2,52.62a22,22,0,0,1-19.79,1.53,22,22,0,0,1-7.12-4.77l0-.05a22,22,0,0,1,7.17-35.75,21.77,21.77,0,0,1,8.39-1.67Zm12.39,9.56a17.64,17.64,0,0,0-5.69-3.8l0,0a17.66,17.66,0,0,0-13.35,0,17.82,17.82,0,0,0-5.68,3.8,17.52,17.52,0,0,0-3.8,5.7l0,0a17.62,17.62,0,0,0-1.3,6.64,17.51,17.51,0,0,0,5.13,12.39,17.51,17.51,0,0,0,24.77,0,17.51,17.51,0,0,0,5.13-12.39A17.25,17.25,0,0,0,79,27.17a17.52,17.52,0,0,0-3.8-5.7ZM59.32,22.7a7.4,7.4,0,1,1-7.39,7.39,7.39,7.39,0,0,1,7.39-7.39Z"/>
                                </svg>
                            </button>
                        </td>
                    </tr>
                ))

            }

            </tbody>
        </table>
    )
}
