import FormField from "../common/forms/FormField";
import {ScheduleView} from "../../types/subscriptions";
import React, {useCallback, useState} from "react";
import Button from "src/components/common/forms/Button";
import AddEditScheduleModal from "src/components/Subscriptions/AddScheduleModal";
import {MdModeEditOutline, MdOutlineRemoveCircle} from "react-icons/md";
import {HiPlusCircle} from "react-icons/hi";

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
    const [scheduleFrom, setScheduleForm] = useState<Partial<ScheduleView>>({
        hours: 0,
        days: 0,
        minutes: 0
    })
    const onChangeScheduleFrom = useCallback((key: keyof ScheduleView, value: any) => {
        setScheduleForm((s) => ({
            ...s,
            [key]: value
        }))
    }, [setScheduleForm])
    const [visibleModal, setVisibleModal] = useState<"NONE" | "ADD_EDIT">("NONE")
    const onEdit = (i: number) => {
        setScheduleForm(schedule?.find(x => x.id == i)!)
        setVisibleModal("ADD_EDIT")
    }
    const onRemove = (i: number) => {
        const data = schedule?.filter(x => x.id != i) ?? []
        onChangeSchedules(data)
    }
    const onAdd = (i: ScheduleView) => {
        const old = schedule?.find(x => x.id == i.id)
        if (old) {
            let data = schedule?.filter(x => x.id != i.id) ?? []
            data.push(i)
            onChangeSchedules(data)
        } else {
            const maxId = (schedule?.length ?? 0) > 0 ? Math.max(...(schedule?.map(o => o.id) ?? [])) + 1 : 1
            const data = [...(schedule ?? []), {...i, id: maxId}]
            onChangeSchedules(data)
        }
    }


    const resolveRecurrence = (r: number) => {
        switch (Number(r)) {
            case 0:
                return "Hourly"
            case 1:
                return "Daily"
            case 2:
                return "Weekly"
            case 3:
                return "Monthly"
        }
    }
    
    return (
        <div className={"mt-3"}>

            {visibleModal === "ADD_EDIT" &&
                <AddEditScheduleModal scheduleFrom={scheduleFrom}
                                      onChangeScheduleFrom={onChangeScheduleFrom}
                                      onAdd={onAdd}
                                      onClose={setVisibleModal.bind(this, "NONE")}
                                      visible={visibleModal === "ADD_EDIT"}/>
            }
            <FormField title={title} className="grow" actionTitle={<div
                className={"text-green-600 rounded "}>
                <HiPlusCircle
                    size={25}/></div>}

                       onClickAction={setVisibleModal.bind(this, "ADD_EDIT")}>
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
                            schedule?.map((i) => (
                                <tr key={i.id} className="bg-white border-b">
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
                                        <div className={"flex flex-row "}>


                                            {
                                                onEdit && <Button onClick={() => {
                                                    onEdit(i.id)
                                                }}
                                                                  variant={"none"}
                                                >
                                                    <MdModeEditOutline className={"text-yellow-300"} size={21}/>
                                                </Button>
                                            }

                                            <Button
                                                variant={"none"}
                                                onClick={() => onRemove!(i.id)}
                                            >
                                                <MdOutlineRemoveCircle className={"text-red-600"} size={21}/>
                                            </Button>
                                        </div>
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
