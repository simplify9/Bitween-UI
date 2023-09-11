import React, {useState} from "react";
import {CreateSubscriptionCategoryModel} from "src/types/subscriptions";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import Modal from "src/components/common/Modal";
import {useCreateSubscriptionCategoryMutation} from "src/client/apis/subscriptionsApi";

type Props = {
    onClose: () => void
}
const CreateCategoryModal: React.FC<Props> = (props) => {
    const [create] = useCreateSubscriptionCategoryMutation()
    const [data, setData] = useState<CreateSubscriptionCategoryModel>({
        code: "",
        description: ""
    });
    const onSubmit = async () => {
        const res = await create(data)
        if ('data' in res)
            props.onClose()
    }
    
    return <Modal onClose={props.onClose} submitLabel={"Create"} onSubmit={onSubmit}
                  submitDisabled={!(data.code && data.description)}>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900"
                id="modal-title">New Subscription Category</h3>
            <div className="mt-4">
                <FormField title="Code" className="grow">
                    <TextEditor placeholder="Type in the id..." value={data.code}
                                onChange={(t) => setData({...data, code: t})}/>
                </FormField>
            </div>
            <div className="mt-4">
                <FormField title="Description" className="grow">
                    <TextEditor placeholder="Type in the name..." value={data.description}
                                onChange={(t) => setData({...data, description: t})}/>
                </FormField>
            </div>

        </div>
    </Modal>
}
export default CreateCategoryModal