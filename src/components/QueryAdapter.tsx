import React from "react";
import { useSearchParams } from "react-router-dom";

  

interface Props<TProps> {
    component: (props:{ params: TProps, onChange:(props:TProps) => void }) => JSX.Element
}


export default <TProps extends {}>({ component }: Props<TProps>) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const C = component;
    let cProps:any = {};
    searchParams.forEach((value, key) => {
        cProps[key] = value;
    });

    const handleChange = (change:TProps) => {
        setSearchParams(change);
    }

    return <C onChange={handleChange} params={cProps} />
}