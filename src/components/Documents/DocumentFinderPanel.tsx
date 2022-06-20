import Tab from "../common/forms/Tab";
import TabNavigator from "../common/forms/TabNavigator";
import {DocumentSpecs} from "../Documents";
import FormField from "../common/forms/FormField";
import TextEditor from "../common/forms/TextEditor";



interface Props {
    value: DocumentSpecs
    onChange: (value:DocumentSpecs) => void
    onFindRequested: () => void
}

export const DocumentFinderPanel:React.FC<Props> = ({
                                                        value,
                                                        onChange,
                                                        onFindRequested
                                                    }) => {



    return (
        <>
            <TabNavigator className="w-full">
                <Tab key="Search" selected={true} onClick={() => {}}>Keyword Search</Tab>

            </TabNavigator>
            <form noValidate className="flex w-full px-4 py-8" onSubmit={onFindRequested}>
                <div className="flex flex-wrap items-end -mx-3 mb-2 space-x-4 w-full">
                    <FormField title="Name" className="grow">
                        <TextEditor placeholder="Type in the name..." value={value.nameContains} onChange={(t) => onChange({...value,nameContains:t})} />
                    </FormField>
                    <button
                        type="submit"
                        className="block appearance-none border bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded drop-shadow-sm focus:drop-shadow-lg focus:outline-none">
                        Find
                    </button>
                </div>
            </form>


        </>
    )
}



