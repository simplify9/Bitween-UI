import Tab from "../common/forms/Tab";
import TabNavigator from "../common/forms/TabNavigator";
import {PartnerSpecs} from "../Partners";
import FormField from "../common/forms/FormField";
import TextEditor from "../common/forms/TextEditor";
import Button from "src/components/common/forms/Button";


interface Props {
    value: PartnerSpecs
    onChange: (value: PartnerSpecs) => void
    onFindRequested: () => void
}

export const PartnerFinderPanel: React.FC<Props> = ({
                                                        value,
                                                        onChange,
                                                        onFindRequested
                                                    }) => {


    return (
        <>
            <TabNavigator className="">
                <Tab key="Search" selected={true} onClick={() => {
                }}>Keyword Search</Tab>

            </TabNavigator>
            <div className="flex w-1/2 px-4 py-8">
                <div className="flex flex-wrap items-end -mx-3 mb-2 space-x-4 w-full">
                    <FormField title="Name" className="grow">
                        <TextEditor placeholder="Type in the name..." value={value.nameContains}
                                    onChange={(t) => onChange({...value, nameContains: t})}/>
                    </FormField>
                    <Button
                        onClick={onFindRequested}
                    >
                        Search
                    </Button>
                </div>
            </div>

        </>
    )
}



