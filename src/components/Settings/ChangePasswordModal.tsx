import React, {useState} from "react";
import {ChangePasswordModel} from "src/types/accounts";
import {apiClient} from "src/client";
import Modal from "src/components/common/Modal";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import {validatePassword} from "src/utils/passwordPolicy";

type Props = {
    onClose: () => void
}
const ChangePasswordModal: React.FC<Props> = ({onClose}) => {

    const [state, setState] = useState<ChangePasswordModel>({
        newPassword: "",
        oldPassword: "",
        newPasswordConfirmation: ""
    });
    const [errors, setErrors] = useState<string[]>([]);
    const onSubmit = async () => {
        setErrors([])
        let errors: string[] = []


        if (state.newPassword !== state.newPasswordConfirmation) {
            errors.push("Passwords dont match")
        }

        errors.push(...validatePassword(state.newPassword))

        if (errors.length > 0) {
            setErrors(errors)
            return
        }
        const res = await apiClient.changePassword(state)
        if (res.succeeded) {
            onClose()
        }
    }
    return <Modal onClose={onClose} onSubmit={onSubmit}>
        <div className="  w-full mb-6 group">

            <FormField title="Old Password" className="grow">
                <TextEditor type={"password"} value={state.oldPassword}
                            onChange={(e) => setState((s) => ({...s, oldPassword: e}))}/>
            </FormField>

        </div>
        <div className="  w-full mb-6 group">
            <FormField title="New Password" className="grow">
                <TextEditor type={"password"} value={state.newPassword}
                            onChange={(e) => setState((s) => ({...s, newPassword: e}))}/>
            </FormField>
        </div>
        <div className="  w-full mb-6 group">
            <FormField title="Confirm your password" className="grow">
                <TextEditor type={"password"} value={state.newPasswordConfirmation}
                            onChange={(e) => setState((s) => ({...s, newPasswordConfirmation: e}))}/>
            </FormField>
        </div>

        <div>
            {
                errors.map(i => <p className={"text-rose-600"}>- {i}</p>)
            }
        </div>

    </Modal>
}

export default ChangePasswordModal