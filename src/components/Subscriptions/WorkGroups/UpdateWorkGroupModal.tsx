import {WorkGroupModel, UpdateWorkGroupModel} from "src/types/subscriptions";
import {useUpdateWorkGroupMutation} from "src/client/apis/subscriptionsApi";
import React, {useState} from "react";
import Modal from "src/components/common/Modal";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";

type Props = {
    workGroup: WorkGroupModel
    onClose: () => void
}
const UpdateWorkGroupModal: React.FC<Props> = (props) => {
    const [update] = useUpdateWorkGroupMutation()
    const [data, setData] = useState<UpdateWorkGroupModel>({
        name: props.workGroup.name,
        busMessageName: props.workGroup.busMessageName,
        id: props.workGroup.id,
        options: props.workGroup.options || {
            rabbitMqOptions: {
                prefetch: undefined,
                priority: undefined
            }
        }
    });
    const onSubmit = async () => {
        const res = await update(data)
        if ('data' in res)
            props.onClose()
    }

    return <Modal onClose={props.onClose} submitLabel={"Update"} onSubmit={onSubmit}
                  submitDisabled={!(data.name && data.busMessageName)}>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900"
                id="modal-title">Update Work Group</h3>
            <div className="mt-4">
                <FormField title="Name" className="grow">
                    <TextEditor placeholder="Type in the name..." value={data.name}
                                onChange={(t) => setData({...data, name: t})}/>
                </FormField>
            </div>
            <div className="mt-4">
                <FormField title="Bus Message Name" className="grow">
                    <TextEditor placeholder="Type in the bus message name..." value={data.busMessageName}
                                onChange={(t) => setData({...data, busMessageName: t})}/>
                </FormField>
            </div>
            <div className="mt-4">
                <FormField title="Prefetch (optional)" className="grow">
                    <TextEditor 
                        placeholder="Type in prefetch value..." 
                        value={data.options?.rabbitMqOptions?.prefetch?.toString() || ""}
                        onChange={(t) => setData({
                            ...data, 
                            options: {
                                ...data.options,
                                rabbitMqOptions: {
                                    ...data.options?.rabbitMqOptions,
                                    prefetch: t ? parseInt(t) : undefined
                                }
                            }
                        })}
                    />
                </FormField>
            </div>
            <div className="mt-4">
                <FormField title="Priority (optional)" className="grow">
                    <TextEditor 
                        placeholder="Type in priority value..." 
                        value={data.options?.rabbitMqOptions?.priority?.toString() || ""}
                        onChange={(t) => setData({
                            ...data, 
                            options: {
                                ...data.options,
                                rabbitMqOptions: {
                                    ...data.options?.rabbitMqOptions,
                                    priority: t ? parseInt(t) : undefined
                                }
                            }
                        })}
                    />
                </FormField>
            </div>
        </div>
    </Modal>
}
export default UpdateWorkGroupModal
