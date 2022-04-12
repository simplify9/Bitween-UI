import { format } from "date-fns"
import { Exchange } from "../../entityModel"
import ExchangeDocument from "./ExchangeDocument"
import ExchangeStatus from "./ExchangeStatus"

interface Props {
    data: Exchange[]
}

export const ExchangeList:React.FC<Props> = ({ data }) => {

    return (
        <table className="appearance-none min-w-full">
          <thead className="border-y bg-gray-50">
            <tr>
              <th scope="col" className="text-sm font-medium w-10 text-gray-900 px-6 py-2 text-left">
                Created on
              </th>
              <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                Document
              </th>
              <th scope="col" className="text-sm tracking-wider font-medium text-gray-900 px-6 py-2 w-10">
                Result
              </th>
              <th scope="col" className="text-sm tracking-wider font-medium text-gray-900 px-6 py-2 text-left">
                Status
              </th>

            </tr>
          </thead>
          <tbody>
            {
              data.map((i) => (
                <tr key={i.id} className="bg-white border-b">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-900 align-top">{format(i.createdOn, "PPpp") ?? ""}</td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      <ExchangeDocument type={i.documentType} promotedProps={i.promotedProps} />
                  </td>
                  
                  <td className="text-center text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap align-top">
                    <button className="border bg-gray-50 px-3 rounded shadow-sm">Download (522 bytes)</button>
                  </td>
                  <td className="text-left text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap align-top">
                    <ExchangeStatus status={i.status} />
                  </td>
                </tr>
              ))

            }
            
          </tbody>
        </table>
    )
}