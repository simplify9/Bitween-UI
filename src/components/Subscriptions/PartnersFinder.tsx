import FormField from "../common/forms/FormField";
import TextEditor from "../common/forms/TextEditor";
import React from "react";
import {useSubscriptionCategoriesQuery} from "src/client/apis/subscriptionsApi";
import {PartnerSpecs} from "src/components/Partners";
import Button from "src/components/common/forms/Button";
import {BsSearch} from "react-icons/bs";

interface Props {
    value: PartnerSpecs
    onChange: (value: PartnerSpecs) => void
    onFindRequested: () => void
}

export const PartnersFinderPanel: React.FC<Props> = ({
                                                             value,
                                                             onChange,
                                                             onFindRequested,
                                                         }) => {


    return (
        <>
            <div className="flex  px-4  w-full">
                <div className="grid grid-cols-2 gap-x-5  justify-between gap-y-2 w-full">
                    <FormField title="Name" className="grow  mr-2">
                        <TextEditor placeholder="Name" value={value.nameContains}
                                    onChange={(t) => onChange({...value, nameContains: t})}
                        />
                    </FormField>
                    <Button
                        className={'mx-5'}
                        variant={"none"}
                        onClick={onFindRequested}
                    >
                        <BsSearch size={33} className={" mb-2 text-primary-600"}/>
                    </Button>
                </div>

            </div>


        </>
    )
}



