import { Exchange } from "../../domain/types"

interface Props {
    data: Exchange[]
}

export const ExchangeList:React.FC<Props> = () => {

    return (
        <table className="appearance-none min-w-full text-center">
          <thead className="border-y bg-gray-50">
            <tr>
            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2">
                Creation Date
              </th>
              <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2">
                Subscription
              </th>
              <th scope="col" className="text-sm tracking-wider font-medium text-gray-900 px-6 py-2">
                Document
              </th>
              <th scope="col" className="text-sm tracking-wider font-medium text-gray-900 px-6 py-2">
                Partner
              </th>
              <th scope="col" className="text-sm tracking-wider font-medium text-gray-900 px-6 py-2">
                Result
              </th>
              <th scope="col" className="text-sm tracking-wider font-medium text-gray-900 px-6 py-2">
                Status
              </th>

            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1</td>
              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                Mark
              </td>
              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                Otto
              </td>
              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                @mdo
              </td>
            </tr>
            <tr className="bg-white border-b">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2</td>
              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                Jacob
              </td>
              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                Thornton
              </td>
              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                @fat
              </td>
            </tr>
            
          </tbody>
        </table>
    )
}