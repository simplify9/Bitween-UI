import { model, Exchange } from "../../entityModel"
import { Denormalized } from "../../redux-cq/core"

interface Props {
    data: Exchange[]
}

export const ExchangeList:React.FC<Props> = ({ data }) => {

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
            {
              data.map((i, idx) => (
                <tr key={i.id} className="bg-white border-b">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i.createdOn.toString() ?? ""}</td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      {i.subscription.desc}
                  </td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    Otto
                  </td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    @mdo
                  </td>
                </tr>
              ))

            }
            
          </tbody>
        </table>
    )
}