import FormField from "../common/forms/FormField";
import {ScheduleView, SubscriptionTypeOptions} from "../../types/subscriptions";
import React, {useId, useState} from "react";
import Button from "src/components/common/forms/Button";
import AddEditScheduleModal
  from "src/components/Subscriptions/AddScheduleModal";
import {filter} from "lodash";

interface Props {
  schedule?: Array<ScheduleView>
  title: string;
  onChangeSchedules: (val: Array<ScheduleView>) => void
}


const ScheduleEditor: React.FC<Props> = ({
                                           title,
                                           schedule,
                                           onChangeSchedules
                                         }) => {

  const [visibleModal, setVisibleModal] = useState<"NONE" | "ADD">("NONE")
  // const [scheduleToEdit,scheduleToEditId]
  const onEdit = (i: ScheduleView) => {

  }
  const onRemove = (i: ScheduleView) => {
    // const data = schedule?.filter(i=>x.)
  }
  const onAdd = (i: ScheduleView) => {

    const data = [...(schedule ?? []), i]
    onChangeSchedules(data)
  }

  const resolveRecurrence = (r: string) => {
   
    switch (r) {
      case "0":
        return "Hourly"
      case "1":
        return "Daily"
      case "2":
        return "Weekly"
      case "3":
        return "Monthly"
    }
  
  }
  return (
    <div className={"mt-3"}>

      {visibleModal === "ADD" &&
        <AddEditScheduleModal onAdd={onAdd}
                              onClose={setVisibleModal.bind(this, "NONE")}
                              visible={visibleModal === "ADD"}/>
      }
      <FormField title={title} className="grow" actionTitle={"+"}
                 onClickAction={setVisibleModal.bind(this, "ADD")}>
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

              <th scope="col"
                  className="text-sm font-medium text-gray-900 px-6 py-2 text-left">

              </th>

            </tr>
            </thead>
            <tbody>
            {
              schedule?.map((i, index) => (
                <tr key={index} className="bg-white border-b">
                  <td
                    className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    {resolveRecurrence(i.recurrence)}
                  </td>
                  <td
                    className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    {i.backwards ? "True" : "False"}
                  </td>
                  <td
                    className="text-sm text-gray-900 font-semibold px-6 py-4 whitespace-nowrap">
                    {`${i.days}.${i.hours}:${i.minutes}`}
                  </td>

                  <td>
                    <Button className={"bg-teal-500 rounded w-5 h-5 mr-1"}
                            onClick={() => onRemove(i)}>-</Button>
                    <Button onClick={() => onEdit(i)}
                            className={"bg-teal-500 rounded w-5 h-5"}>!</Button>
                  </td>

                </tr>
              ))

            }

            </tbody>
          </table>


        </div>

      </FormField>
    </div>
  );
}

export default ScheduleEditor;
