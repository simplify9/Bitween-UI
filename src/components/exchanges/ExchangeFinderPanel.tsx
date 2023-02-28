import {ExchangeFindBy} from "./ExchangeFindBy";
import {ExchangeFindQuery} from "src/types/xchange";
import React from "react";


interface Props {
    value: ExchangeFindQuery
    onChange: (value: ExchangeFindQuery) => void
    onFindRequested: () => void
    onClear: () => void
}

export const ExchangeFinderPanel: React.FC<Props> = ({
                                                         value,
                                                         onChange,
                                                         onFindRequested,
                                                         onClear
                                                     }) => {


    return (
        <>

            <ExchangeFindBy
                value={value}
                onClear={onClear}
                onChange={newData => onChange(newData)}
                onFindRequested={onFindRequested}/>

        </>
    )
}



