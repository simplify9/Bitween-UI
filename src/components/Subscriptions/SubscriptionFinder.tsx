import FormField from "../common/forms/FormField";
import TextEditor from "../common/forms/TextEditor";
import React from "react";
import PartnerSelector from "src/components/Partners/PartnerSelector";
import {SubscriptionFindQuery, SubscriptionTypes} from "src/types/subscriptions";
import AdapterSelector from "src/components/Subscriptions/AdapterSelector";
import ChoiceEditor from "src/components/common/forms/ChoiceEditor";
import {useSubscriptionCategoriesQuery, useWorkGroupsQuery} from "src/client/apis/subscriptionsApi";
import DocumentSelector from "src/components/Documents/DocumentSelector";
import {useTypedSelector} from "src/state/ReduxSotre";

interface Props {
    value: SubscriptionFindQuery
    onChange: (value: SubscriptionFindQuery) => void
    onSearch?: (value: SubscriptionFindQuery) => void
    onFindRequested: () => void
    searchAdapterData?: boolean
}

export const SubscriptionFinderPanel: React.FC<Props> = ({
                                                            value,
                                                            onChange,
                                                            onSearch = onChange,
                                                            onFindRequested,
                                                            searchAdapterData
                                                        }) => {

    const { workGroupsAvailable } = useTypedSelector(state => state.features);
    const subscriptionCategories = useSubscriptionCategoriesQuery({limit: 1000, offset: 0})
    const workGroups = useWorkGroupsQuery({limit: 1000, offset: 0}, {skip: !workGroupsAvailable})

    return (
        <>
            <div className="flex  md:px-4  w-full">
                <div className="grid md:grid-cols-5 md:gap-x-5 gap-y-2 w-full">
                    {
                        searchAdapterData && <FormField title="Name" className="grow  md:mr-2">
                            <TextEditor placeholder="Name" value={value.nameContains}
                                        onChange={(t) => onChange({...value, nameContains: t})}
                                        onKeyDown={(e) => e.key === 'Enter' && onFindRequested()}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData && <FormField title="Id" className="grow  md:mr-2">
                            <TextEditor placeholder="Id" value={value.id}
                                        onChange={(t) => onChange({ ...value, id: t !== '' ? Number(t) : undefined })}
                                        onKeyDown={(e) => e.key === 'Enter' && onFindRequested()}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Adapter Properties" className="grow md:mr-2">
                            <TextEditor placeholder="Adapter data" value={value.rawsubscriptionproperties}
                                        onChange={(t) => onChange({...value, rawsubscriptionproperties: t})}
                                        onKeyDown={(e) => e.key === 'Enter' && onFindRequested()}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Filter Properties" className="grow md:mr-2">
                            <TextEditor placeholder="Filter data" value={value.rawfiltersproperties}
                                        onChange={(t) => onChange({...value, rawfiltersproperties: t})}
                                        onKeyDown={(e) => e.key === 'Enter' && onFindRequested()}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Partner" className="grow ">
                            <PartnerSelector value={value.partnerId}
                                            onChange={val => onSearch({...value, partnerId: val})}/>

                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Document" className="grow ">
                            <DocumentSelector value={value.documentId?.toString()}
                                            onChange={(val) => onSearch({...value, documentId: val ? Number(val) : undefined})}/>

                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Validator" className=" grow ">
                            <AdapterSelector type={'validators'} value={value.validatorId}
                                            onChange={(val) => onSearch({...value, validatorId: val})}/>
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Receiver" className="grow">
                            <AdapterSelector type={'receivers'} value={value.receiverId}
                                            onChange={(val) => onSearch({...value, receiverId: val})}/>
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Mapper" className="grow">
                            <AdapterSelector type={'mappers'} value={value.mapperId}
                                            onChange={(val) => onSearch({...value, mapperId: val})}/>
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Handler" className="grow">
                            <AdapterSelector type={'handlers'} value={value.handlerId}
                                            onChange={(val) => onSearch({...value, handlerId: val})}/>
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Type" className="grow">
                            <ChoiceEditor value={value.type?.toString()}
                                        options={SubscriptionTypes}
                                        optionValue={o => o.value}
                                        optionTitle={i => i.label}
                                        onChange={(val) => onSearch({...value, type: val ? Number(val) : undefined})}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Category" className="grow">
                            <ChoiceEditor
                                value={value?.categoryId != null && value.categoryId !== undefined ? value.categoryId.toString() : ""}
                                onChange={(val) => onSearch({...value, categoryId: val ? Number(val) : undefined})}
                                optionTitle={(item) => item.code}
                                optionValue={(item) => item.id?.toString()}
                                options={subscriptionCategories.data?.result ?? []}/>
                        </FormField>
                    }
                    {
                        searchAdapterData && workGroupsAvailable &&
                        <FormField title="Work Group" className="grow">
                            <ChoiceEditor
                                value={value?.workGroupId != null && value.workGroupId !== undefined ? value.workGroupId.toString() : ""}
                                onChange={(val) => onSearch({...value, workGroupId: val ? Number(val) : undefined})}
                                optionTitle={(item) => item.name}
                                optionValue={(item) => item.id?.toString()}
                                options={Array.isArray(workGroups.data?.result) 
                                    ? workGroups.data.result.map(wg => ({id: wg.id, name: wg.name})) 
                                    : []}/>
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="State" className="grow">
                            <ChoiceEditor value={value.isRunning == null ? '' : value.isRunning ? 'Running' : 'Idle'}
                                        options={[
                                            {value: undefined, label: 'All'},
                                            {value: 'Idle', label: 'Idle'},
                                            {value: 'Running', label: 'Running'},

                                        ]}
                                        optionValue={o => o.value}
                                        optionTitle={i => i.label}
                                        onChange={(val) => onSearch({...value, isRunning: !val ? null : val === 'Running'})}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Status" className="grow">
                            <ChoiceEditor value={value.inactive == null ? '' : value.inactive ? 'Inactive' : 'Active'}
                                        options={[
                                            {value: undefined, label: 'All'},
                                            {value: 'Active', label: 'Active'},
                                            {value: 'Inactive', label: 'Inactive'},

                                        ]}
                                        optionValue={o => o.value}
                                        optionTitle={i => i.label}
                                        onChange={(val) => onSearch({...value, inactive: val === undefined ? null : val === 'Inactive'})}
                            />
                        </FormField>
                    }
                </div>

            </div>


        </>
    )
}



