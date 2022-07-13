import FormField from "../common/forms/FormField";
import {SubscriptionTypeOptions} from "../../types/subscriptions";

interface Props {
    schedule?:any[]
    title:string;
}


const ScheduleEditor:React.FC<Props> = ({ title,schedule }) => {



    return (
        <>
            <div className={"flex flex-col gap-2"}>
                <FormField title={title} className="grow"></FormField>

                <table className="appearance-none min-w-full">
                    <thead className="border-y bg-gray-50">
                    <tr>
                        <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                            Recurrence
                        </th>
                        <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                            Backwards
                        </th>
                        <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                            Schedule
                        </th>
                        <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">

                        </th>


                    </tr>
                    </thead>
                    <tbody>
                    {
                        schedule?.map((i) => (
                            <tr key={i.id} className="bg-white border-b">
                                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                    {i.recurrence}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                    {i.backwards ? "True" : "False"}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                    {i.schedule}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">

                                </td>

                            </tr>
                        ))

                    }

                    </tbody>
                </table>


            </div>

        </>
    );
}

export default ScheduleEditor;
