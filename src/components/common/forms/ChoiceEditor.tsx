import React, {useEffect, useMemo, useState} from "react"
import {noOp} from "./utils"
import Select from 'react-select'


export type OptionRenderProps<TOption> = {
    option: TOption
    selected: boolean
    title: string
    value: string
    select: () => void
}

export type FetcherParams = {
    partialInput: string
    value: string
}

type State<TOption> = {
    optionList: TOption[]
    partialInput: string
}

type Props<TOption extends {}> =
    {
        disabled?: boolean
        placeholder?: string
        value?: string
        onChange?: (value: string) => void
        options: TOption[] | ((params: FetcherParams) => Promise<TOption[]>)
        optionValue: (option: TOption) => string
        optionTitle: (option: TOption) => string
        renderOption?: (props: OptionRenderProps<TOption>) => JSX.Element
    }


export const ChoiceEditor = <TOption extends {} = any>({
                                                           placeholder,
                                                           onChange = noOp,
                                                           value = "",
                                                           options,
                                                           optionTitle,
                                                           optionValue,
                                                           disabled,
                                                       }: Props<TOption>): JSX.Element => {

    const [state, setState] = useState<State<TOption>>(() => ({
        partialInput: "",
        optionList: []
    }));

    useEffect(() => {

        const promiseFn = Array.isArray(options) ? () => Promise.resolve(options) : options;

        promiseFn({value, partialInput: state.partialInput})
            .then(optionList => {
                const selectedOption = optionList.filter(opt => optionValue(opt) === value)[0];
                setState(s => ({
                    ...s,
                    partialInput: selectedOption ? optionTitle(selectedOption) : s.partialInput,
                    optionList
                }));
            });

    }, [value, options, state.partialInput, optionValue, optionTitle]);

    const optionData = useMemo(() => {
        return state.optionList?.map(opt => ({
            label: optionTitle(opt),
            value: optionValue(opt),
        }));
    }, [onChange, optionTitle, optionValue, state.optionList])

    return (
        <div className={""}>
            <Select
                isClearable={true}
                isDisabled={disabled}
                options={optionData}
                value={optionData.find(i => i.value == value)}
                onChange={(newValue) => {
                    onChange(newValue?.value)
                }}
                placeholder={placeholder}
                className={"w-full  shadow min-w-[200px]"}
                styles={{
                    control: (base) => {
                        return {
                            ...base,
                            minHeight: '42px'
                        }
                    },

                }}/>
        </div>
    )
}

export default ChoiceEditor