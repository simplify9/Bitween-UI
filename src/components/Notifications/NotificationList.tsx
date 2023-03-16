import {NotificationModel} from "src/types/notifiers";
import React, {useState} from "react";
import {toLocalDateTimeString} from "src/utils/DateUtils";
import NotificationExceptionViewer from "src/components/Notifications/NotificationExceptionViewer";

type Props = {
    data: NotificationModel[]
}
const NotificationList: React.FC<Props> = ({data}) => {
    const [exception, setException] = useState<string | null>(null);

    return <div>
        {
            exception && <NotificationExceptionViewer exception={exception} onClose={() => setException(null)}/>

        }
        <table className="appearance-none min-w-full">
            <thead className="border-y bg-gray-50">
            <tr>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-1 text-left">
                    ID
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-1 text-left">
                    Name
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-1 text-left">
                    Xchange Id
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-1 text-left">
                    Subscriptions
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-1 text-left">
                    Finished on
                </th>

            </tr>
            </thead>
            <tbody>
            {
                data.map((i) => (
                    <tr key={i.id} className="bg-white border-b">
                        <td className="text-sm text-gray-900 font-light px-6 py-1 whitespace-nowrap">
                            {i.id}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-1 whitespace-nowrap">
                            {i.notifierName}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-1 whitespace-nowrap">
                            {i.xchangeId}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-1 whitespace-nowrap"
                            onClick={() => setException(i.exception)}>
                            <div
                                className={`px-2 py-1 w-20 text-center text-grey-200 rounded-lg ${i.success ? " bg-green-200 " : "bg-red-200"}`}>
                                {i.success ? "Success" : "Failed"}
                            </div>
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-1 whitespace-nowrap">
                            {toLocalDateTimeString(i.finishedOn)}
                        </td>
                    </tr>
                ))

            }

            </tbody>
        </table>
    </div>
}
export default NotificationList