import {DocumentSpecs} from "../Documents";
import FormField from "../common/forms/FormField";
import TextEditor from "../common/forms/TextEditor";
import Button from "src/components/common/forms/Button";


interface Props {
    value: DocumentSpecs
    onChange: (value: DocumentSpecs) => void
    onFindRequested: () => void
}

export const DocumentFinderPanel: React.FC<Props> = ({
                                                         value,
                                                         onChange,
                                                         onFindRequested
                                                     }) => {


    return (
        <div className={"shadow  px-3 py-2 my-2 mx-2 rounded-lg bg-white"} style={{zIndex: 1000}}>
            <div className="flex flex-wrap items-end  mb-2 space-x-4 w-full">
                <FormField title="Name" className="grow">
                    <TextEditor placeholder="Type in the name..." value={value.nameContains}
                                onChange={(t) => onChange({...value, nameContains: t})}/>
                </FormField>
                <Button
                    onClick={onFindRequested}>
                    Search
                </Button>
            </div>
        </div>
    )
}



