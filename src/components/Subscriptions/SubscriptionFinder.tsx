import Tab from "../common/forms/Tab";
import TabNavigator from "../common/forms/TabNavigator";
import {SubscriptionSpecs} from "../Subscriptions";
import FormField from "../common/forms/FormField";
import TextEditor from "../common/forms/TextEditor";
import React from "react";


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
            <TabNavigator className="w-full">
                <Tab key="Search" selected={true} onClick={() => {
                }}>
                    Find by
                </Tab>
            </TabNavigator>

            <div className="flex w-1/2 px-4 py-5 pb-3">
                <div className="flex flex-wrap items-end -mx-3 mb-2 space-x-4 w-full">
                    <FormField title="Name" className="grow">
                        <TextEditor placeholder="Type in the name..." value={value.nameContains}
                                    onChange={(t) => onChange({...value, nameContains: t})}
                        />
                    </FormField>
                    <button
                        onClick={onFindRequested}
                        className="block appearance-none border bg-blue-900 hover:bg-blue-900 text-white py-2 px-4 rounded drop-shadow-sm focus:drop-shadow-lg focus:outline-none">
                        Find
                    </button>
                </div>
            </div>


        </>
    )
}



