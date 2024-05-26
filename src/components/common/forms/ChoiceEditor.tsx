import React from "react"
import {noOp} from "./utils"
import Select from 'react-select'

//
// export type OptionRenderProps<TOption> = {
//     option: TOption
//     selected: boolean
//     title: string
//     value: string
//     select: () => void
// }

// export type FetcherParams = {
//     partialInput: string
//     value: string
// }
//
// type State<TOption> = {
//     optionList: TOption[]
//     partialInput: string
// }

type Props =
    {
        disabled?: boolean
        placeholder?: string
        value?: string
        onChange?: (value: string) => void
        options: any[]
        optionValue: (option: any) => string
        optionTitle: (option: any) => string
        menuPlacement?: "top" | "bottom"

    }


export const ChoiceEditor = <TOption extends {} = any>({
                                                           placeholder,
                                                           onChange = noOp,
                                                           value = "",
                                                           options,
                                                           menuPlacement = "bottom",
                                                           optionTitle,
                                                           optionValue,
                                                           disabled,
                                                       }: Props): JSX.Element => {

    return (
        <div>
            <Select
                menuPlacement={menuPlacement}
                getOptionLabel={optionTitle}
                getOptionValue={(e) => {
                    return optionValue(e)
                }}
                isClearable={true}
                isDisabled={disabled}
                options={options}
                value={options.find(i => optionValue(i) == value)}
                onChange={(newValue) => {
                    if (Boolean(newValue)) {
                        onChange(optionValue(newValue))
                    } else {
                        onChange(undefined)
                    }
                }}
                placeholder={placeholder}
                className={"w-full  shadow "}
                styles={{
                    // @ts-ignore
                    control: (base) => {
                        return {
                            ...base,
                            minHeight: '42px'
                        }
                    },
                    placeholder: (base) => {
                        return {
                            ...base,
                            fontSize: '0.875rem',
                            lineHeight: '1.25rem',
                        }
                    },

                }}/>
        </div>
    )
}

export default ChoiceEditor