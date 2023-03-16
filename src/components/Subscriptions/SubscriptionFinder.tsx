import Tab from "../common/forms/Tab";
import TabNavigator from "../common/forms/TabNavigator";
import {SubscriptionSpecs} from "../Subscriptions";
import FormField from "../common/forms/FormField";
import TextEditor from "../common/forms/TextEditor";
import React from "react";
import Button from "src/components/common/forms/Button";


interface Props {
    value: SubscriptionSpecs
    onChange: (value: SubscriptionSpecs) => void
    onFindRequested: () => void
}

export const SubscriptionFinderPanel: React.FC<Props> = ({
                                                             value,
                                                             onChange,
                                                             onFindRequested
                                                         }) => {


    return (
        <>
            <div className="flex flex-row w-1/2 px-4 ">
                <div className="flex flex-wrap items-end -mx-3 mb-2 space-x-4 w-full">
                    <FormField title="Name" className="grow">
                        <TextEditor placeholder="Type in the name..." value={value.nameContains}
                                    onChange={(t) => onChange({...value, nameContains: t})}
                        />
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



