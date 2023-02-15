import {MatchExpression} from "src/types/subscriptions";
import React from "react";
import MatchExpressionBlock from "src/components/Subscriptions/MatchExpressionEditor/MatchExpressionBlock";
import {OptionType} from "src/types/common";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";


type Props = {
    value: MatchExpression
    onChange: (value: MatchExpression) => void
    promotedProperties: OptionType[]
}

const ExpressionBranch: React.FC<Props> = ({value, promotedProperties, onChange}) => {

    //const [state, setState] = useState<MatchExpression>(value)

    if (!Boolean(value))
        return <div>
            <MatchExpressionBlock value={value} onChange={onChange}/>
        </div>

    // return <>{Description(value)}</>
    if (value.type === "or" || value.type === "and") {
        return <div className={"border shadow p-1 flex flex-row justify-between"}>
            <div className={" border shadow p-1  border border-blue-400 w-5/12"}>
                <ExpressionBranch promotedProperties={promotedProperties} onChange={(e) => {
                    //@ts-ignore
                    onChange(({...value, left: e}))
                }} value={value.left}/>
            </div>
            <div className={" my-2 flex justify-around "}>
                <div
                    onClick={() => {
                        onChange(({...value, type: value.type == "or" ? 'and' : "or"}))
                    }}
                    className={"shadow rounded text-center p-1 w-[120px] bg-green-300 "}
                >
                    {value.type.toUpperCase()}
                </div>
            </div>
            <div className={" border shadow p-1  border border-red-400 w-5/12"}>
                <ExpressionBranch promotedProperties={promotedProperties} onChange={(e) => {
                    //@ts-ignore
                    onChange(({...value, right: e}))
                }} value={value.right}/>

            </div>
        </div>
    }
    if (value.type === "not_one_of" || value.type === "one_of") {
        return <div className={"border shadow p-1 flex flex-col justify-between"}>

            <div className={"mt-2"}>
                <FormField title="Path" className="grow">
                    <TextEditor onChange={(e) => {
                        //  setState((c) => ({...c, path: e}))
                        onChange({...value, path: e})
                    }} value={value.path}/>
                </FormField>
            </div>
            <div className={" my-2  justify-around "}>
                <div
                    onClick={() => {
                        // @ts-ignore
                        onChange({...value, type: value.type == "one_of" ? 'not_one_of' : "one_of"})

                        //  setState((c) => ({...c, type: state.type == "one_of" ? 'not_one_of' : "one_of"}))
                    }}
                    className={"shadow rounded text-center p-1 w-[120px] bg-green-300 "}
                >
                    {value.type.toUpperCase()}
                </div>
            </div>
            <div className={""}>
                <FormField title="Values" className="grow">
                    <TextEditor onChange={(e) => {
                        // setState((c) => ({...c, values: e.split(",")}))
                        onChange({...value, values: e.split(",")})
                    }} value={value.values.join(",")}/>
                </FormField>
            </div>
        </div>
    }
}
export default ExpressionBranch