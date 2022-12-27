import Modal from "src/components/common/Modal";
import React, {useState} from "react";
import {CreateAccountModel} from "src/types/accounts";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import {apiClient} from "src/client";

type Props = {
    onClose: () => void
}
const AddMemberModal: React.FC<Props> = ({onClose}) => {

    const [state, setState] = useState<CreateAccountModel>({name: "", email: "", password: ""});

    const onSubmit = async () => {
        const res = await apiClient.createMember(state)
        if (res.succeeded) {
            onClose()
        }
    }
    return <Modal onClose={onClose} onSubmit={onSubmit}>
        <div className="relative z-0 w-full mb-6 group">
            <FormField title="Name" className="grow">
                <TextEditor value={state.name} onChange={(e) => setState((s) => ({...s, name: e}))}/>
            </FormField>

        </div>
        <div className="relative z-0 w-full mb-6 group">

            <FormField title="Email" className="grow">
                <TextEditor type={"email"} value={state.email} onChange={(e) => setState((s) => ({...s, email: e}))}/>
            </FormField>

        </div>
        <div className="relative z-0 w-full mb-6 group">

            <FormField title="Password" className="grow">
                <TextEditor type={"password"} value={state.password}
                            onChange={(e) => setState((s) => ({...s, password: e}))}/>
            </FormField>
        </div>
    </Modal>
}

export default AddMemberModal