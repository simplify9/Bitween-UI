import {ChangeEventHandler, useCallback, useEffect, useMemo, useState} from "react"
import Input from "./Input"
import InputBox from "./InputBox"
import InputPopOver from "./InputPopOver"
import {noOp} from "./utils"


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
    Omit<JSX.IntrinsicElements['input'], "onChange">
    & {
    value?: string
    onChange?: (value: string) => void
    options: TOption[] | ((params: FetcherParams) => Promise<TOption[]>)
    optionValue: (option: TOption) => string
    optionTitle: (option: TOption) => string
    renderOption?: (props: OptionRenderProps<TOption>) => JSX.Element
}

const createSelector = (changeHandler: (value: string) => void, value: string) => {
    return () => {
        changeHandler(value);
    }
}

const defaultRenderOption = (props: OptionRenderProps<any>): JSX.Element => {
    return (
        <div className={"relative"} style={{zIndex: 50000000}}>
            <div
                key={props.value}
                className={"px-4 relative py-2 break-all " + (props.selected ? "bg-blue-900 text-white cursor-default" : "hover:bg-gray-100 cursor-pointer")}
                title={props.title}
                style={{zIndex: 50000000}}
                onClick={props.select}>
                {props.title}
            </div>
        </div>
    );
}

export const ChoiceEditor = <TOption extends {} = any>({
                                                           placeholder,
                                                           children,
                                                           onChange = noOp,
                                                           value = "",
                                                           options,
                                                           optionTitle,
                                                           optionValue,
                                                           renderOption = defaultRenderOption,
                                                           ...htmlProps
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

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setState(s => ({
            ...s,
            partialInput: e.target.value
        }));
        onChange("");
    }

    const handleBlur = useCallback(() => {

        setState(s => {
            const selectedOption = s.optionList.filter(opt => optionValue(opt) === value)[0];
            return {
                ...s,
                partialInput: selectedOption ? optionTitle(selectedOption) : ""
            };
        });
    }, [optionTitle, optionValue, value])

    const optionList = useMemo(() => {
        return state.optionList?.map(opt => renderOption({
            option: opt,
            title: optionTitle(opt),
            value: optionValue(opt),
            selected: optionValue(opt) === value,
            select: createSelector(onChange, optionValue(opt))
        }))
    }, [onChange, optionTitle, optionValue, renderOption, state.optionList, value])

    return (
        <span>
    <InputBox {...htmlProps} withPopOver>
      <Input
          type="text"
          disabled={htmlProps.disabled}
          placeholder={placeholder}
          value={state.partialInput}
          onChange={handleChange}
          onBlur={handleBlur}/>
      <InputPopOver className="flex   flex-col divide-y overflow-scroll max-h-[400px] z-50">
        {optionList}
      </InputPopOver>
    </InputBox>
       </span>
    )
}
