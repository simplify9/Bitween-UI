import Modal from "src/components/common/Modal";
import React, {useState} from "react";
import { EditModal, RolesSelection} from "src/types/accounts";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import {useUpdateMemberMutation} from "src/client/apis/generalApi";


type Props = {
    onClose: () => void
    member:EditModal
}
const EditMemberModal:React.FC<Props> = ({onClose,member}) => {
    const [fetchMemberInfo,isSuccess]=useUpdateMemberMutation()

    const [state, setState] = useState(member);
    const [errors, setErrors] = useState<string[]>([]);
    const onSubmit = async () => {
        setErrors([])
        let errors: string[] = []

        if (state.name?.length < 3) {
            errors.push("Name must be longer than 3 characters")

        if (errors.length > 0) {
            setErrors(errors)
            return ;
        }


    }
        await fetchMemberInfo(state)
        if (isSuccess)
        onClose()

    }



    return <Modal onClose={onClose} onSubmit={onSubmit}>
        <div className="  w-full mb-6 ">
            <FormField title="Name" className="grow">
                <TextEditor value={state.name} onChange={(e) => setState((s) => ({...s, name: e}))}/>
            </FormField>

        </div>

        <div className="  w-full mb-6 ">
            <FormField title="Role" className="grow">
                <ChoiceEditor optionTitle={(e) => e.title} optionValue={(e) => e.id} options={RolesSelection}
                              value={state.role.toString()}
                              onChange={(e) => setState((s) => ({...s, role:Number(e)}))}/>
            </FormField>

        </div>
        <div>
            {
                errors.map(i => <p className={"text-rose-600"}>- {i}</p>)
            }
        </div>

    </Modal>
}

export default EditMemberModal;
