import {useDeleteWorkGroupMutation} from "src/client/apis/subscriptionsApi";
import Button from "src/components/common/forms/Button";
import {MdModeEditOutline, MdOutlineRemoveCircle} from "react-icons/md";
import React, {Fragment, useState} from "react";
import {WorkGroupModel} from "src/types/subscriptions";
import UpdateWorkGroupModal from "src/components/Subscriptions/WorkGroups/UpdateWorkGroupModal";

type Props = {
    data: WorkGroupModel[]
    onRefresh?: () => void
}
const WorkGroupsList: React.FC<Props> = (props) => {
    const [deleteWorkGroup] = useDeleteWorkGroupMutation()
    const [workGroupToBeEdited, setWorkGroupToBeEdited] = useState<WorkGroupModel | null>(null);
    const onClickDelete = async (id: number) => {
        console.log("deleting")
        const result = await deleteWorkGroup({id})
        if ('data' in result) {
            // Trigger refresh after successful delete
            props.onRefresh?.();
        }
    }
    
    const handleEditClose = () => {
        setWorkGroupToBeEdited(null);
        // Trigger refresh after edit modal closes
        props.onRefresh?.();
    };
    return (
        <Fragment>

            {workGroupToBeEdited &&
                <UpdateWorkGroupModal workGroup={workGroupToBeEdited} onClose={handleEditClose}/>
            }

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
                        Bus Message Name
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Prefetch
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Priority
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Processor Ack Rate
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Processor Incoming Rate
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Processor Processing
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Processor Queue
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Notifier Ack Rate
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Notifier Incoming Rate
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Notifier Processing
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Notifier Queue
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    </th>
                </tr>
                </thead>
                <tbody>
                {
                    props.data?.map((i) => (
                        <tr key={i.id} className="bg-white border-b">
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.id}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.name}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.busMessageName}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.options?.rabbitMqOptions?.prefetch ?? '-'}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.options?.rabbitMqOptions?.priority ?? '-'}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.processorAckRate?.toFixed(2) ?? '-'}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.processorIncomingRate?.toFixed(2) ?? '-'}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.processorProcessingCount ?? '-'}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.processorQueueCount ?? '-'}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.notifierAckRate?.toFixed(2) ?? '-'}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.notifierIncomingRate?.toFixed(2) ?? '-'}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.notifierProcessingCount ?? '-'}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.notifierQueueCount ?? '-'}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.id !== 0 && (
                                    <div className={"flex flex-row gap-3"}>
                                        
                                    <Button variant={"none"} onClick={() => onClickDelete(i.id)}
                                    >
                                        <div className={"text-red-600"}>
                                            <MdOutlineRemoveCircle size={21}/>
                                        </div>
                                    </Button>
                                    <Button variant={"none"} onClick={() => setWorkGroupToBeEdited(i)}
                                    >
                                        <div className={"text-yellow-400"}>
                                            <MdModeEditOutline size={21}/>
                                        </div>
                                        
                                    </Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))

                }

                </tbody>
            </table>
        </Fragment>
    )
}

export default WorkGroupsList
