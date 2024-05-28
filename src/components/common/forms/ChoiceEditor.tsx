import React, {useCallback, useMemo} from "react"
import {noOp} from "./utils"
import Select, {StylesConfig} from 'react-select'

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

    const onChangeValue = useCallback((newValue) => {
        if (Boolean(newValue)) {
            onChange(optionValue(newValue))
        } else {
            onChange(undefined)
        }
    }, [optionValue])
    const styles = useMemo(() => {
        return {
            // @ts-ignore
            control: (base) => {
                return {
                    ...base,
                    minHeight: '42px'
                }
            },
        } satisfies  StylesConfig<any, false, any>

    }, [])
    const selectedValue = useMemo(() => {
        if (!Array.isArray(options))
            return ""
        return options?.find(i => optionValue(i) == value)
    }, [value, optionValue, options])
    return (
        <Select
            id={placeholder}
            key={`${placeholder}_select`}
            menuPlacement={menuPlacement}
            getOptionLabel={optionTitle}
            getOptionValue={optionValue}
            autoFocus={true}
            isClearable={true}
            isDisabled={disabled}
            options={options ?? []}
            value={selectedValue}
            onChange={onChangeValue}
            placeholder={placeholder}
            className={"w-full  shadow text-sm  "}
            styles={styles}
        />
    )
}

export default ChoiceEditor