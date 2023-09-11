import {SubscriptionCategoryModel, UpdateSubscriptionCategoryModel} from "src/types/subscriptions";
import {useUpdateSubscriptionCategoryMutation} from "src/client/apis/subscriptionsApi";
import React, {useState} from "react";
import Modal from "src/components/common/Modal";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";

type Props = {
    category: SubscriptionCategoryModel
    onClose: () => void
}
const UpdateCategoryModal: React.FC<Props> = (props) => {
    const [update] = useUpdateSubscriptionCategoryMutation()
    const [data, setData] = useState<UpdateSubscriptionCategoryModel>({
        code: props.category.code,
        description: props.category.description,
        id: props.category.id
    });
    const onSubmit = async () => {
        const res = await update(data)
        if ('data' in res)
            props.onClose()
    }

    return <Modal onClose={props.onClose} submitLabel={"Update"} onSubmit={onSubmit}
                  submitDisabled={!(data.code && data.description)}>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900"
                id="modal-title">Update Subscription Category</h3>
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
export default UpdateCategoryModal