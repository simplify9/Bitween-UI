import FormField from "../common/forms/FormField";
import {ScheduleView, SubscriptionTypeOptions} from "../../types/subscriptions";
import React, {useId} from "react";

interface Props {
  schedule?: Array<ScheduleView>
  title: string;
}


const ScheduleEditor: React.FC<Props> = ({ title, schedule }) => {


  return (
    <FormField title={title} className="grow">
      <div className={"flex flex-col gap-2"}>


        <table className="appearance-none min-w-full">
          <thead className="border-y bg-gray-50">
          <tr>
            <th scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
              Recurrence
            </th>
            <th scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
              Backwards
            </th>
            <th scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
              Schedule
            </th>


          </tr>
          </thead>
          <tbody>
          {
            schedule?.map((i, index) => (
              <tr key={index} className="bg-white border-b">
                <td
                  className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  {i.recurrence}
                </td>
                <td
                  className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  {i.backwards ? "True" : "False"}
                </td>
                <td
                  className=" text-gray-900 font-semibold px-6 py-4 whitespace-nowrap">
                  {`${i.days}.${i.hours}:${i.minutes}`}
                </td>


              </tr>
            ))

          }

          </tbody>
        </table>


      </div>

    </FormField>
  );
}

export default ScheduleEditor;
