import Modal from "src/components/common/Modal";
import React, {useState} from "react";
import {CreateAccountModel, RolesSelection} from "src/types/accounts";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import {apiClient} from "src/client";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";

function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

type Props = {
    onClose: () => void
}
const AddMemberModal: React.FC<Props> = ({onClose}) => {

    const [state, setState] = useState<CreateAccountModel>({name: "", email: "", password: "", role: 0});
    const [errors, setErrors] = useState<string[]>([]);
    const onSubmit = async () => {
        setErrors([])
        let errors: string[] = []
        if (!isValidEmail(state.email)) {
            errors.push("Invalid email")
        }
        if (state.name?.length < 3) {
            errors.push("Name must be longer than 3 characters")
        }
        if (state.password?.length < 7) {
            errors.push("Password must be longer than 8 characters")
        }
        if (errors.length > 0) {
            setErrors(errors)
            return;
        }


        const res = await apiClient.createMember(state)
        if (res.succeeded) {
            onClose()
        }
    }

    return <Modal onClose={onClose} onSubmit={onSubmit}>
        <div className="  w-full mb-6 ">
            <FormField title="Name" className="grow">
                <TextEditor value={state.name} onChange={(e) => setState((s) => ({...s, name: e}))}/>
            </FormField>

        </div>
        <div className="  w-full mb-6 ">

            <FormField title="Email" className="grow">
                <TextEditor type={"email"} value={state.email} onChange={(e) => setState((s) => ({...s, email: e}))}/>
            </FormField>

        </div>

        <div className="  w-full mb-6 ">

            <FormField title="Password" className="grow">
                <TextEditor type={"password"} value={state.password}
                            onChange={(e) => setState((s) => ({...s, password: e}))}/>
            </FormField>
        </div>
        <div className="  w-full mb-6 ">

            <FormField title="Role" className="grow">
                <ChoiceEditor optionTitle={(e) => e.title} optionValue={(e) => e.id} options={RolesSelection}
                              value={state.role?.toString()}
                              onChange={(e) => setState((s) => ({...s, role: Number(e)}))}/>
            </FormField>

        </div>
        <div>
            {
                errors.map(i => <p className={"text-rose-600"}>- {i}</p>)
            }
        </div>

    </Modal>
}

export default AddMemberModal