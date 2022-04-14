import { formatISO, isValid, parseISO } from "date-fns";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CqBoolean, CqDateTime, CqNumber, CqString, DenormalizedType, EntityModel, QueryHook, QueryResults, SQuery } from "redux-ecq";


type SelfOrArray<T> = T | T[]

type Scalar = CqString | CqBoolean | CqDateTime | CqNumber 

type QuerySchema = SelfOrArray<Scalar>

export type QueryStringMapping<TQuery> = {
    [param in keyof TQuery]: QuerySchema 
}

type HookResult<TQuery> = [TQuery,(params:Partial<TQuery>) => void]

const parse = (node:QuerySchema, rawValue:string):any => {
    if (Array.isArray(node)) {
        return rawValue.split(",").filter(token => token !== undefined).map(token => parse(node[0], token));
    }
    else if (rawValue === undefined || rawValue === "") {
        return undefined;
    }
    else if (node.type === "boolean") {
        return rawValue.toUpperCase() === "TRUE";
    }
    else if (node.type === "datetime") {
        const n = parseISO(rawValue);
        return isValid(n) ? n : undefined;
    }
    else if (node.type === "number") {
        const n = parseInt(rawValue);
        return isNaN(n) ? undefined : n;
    }
    else if (node.type === "string") {
        return rawValue;
    }
    throw "Type not supported";
}

const encode = (node:QuerySchema, value:any):any => {
    if (value === undefined || value === "" || value === null) {
        return "";
    }
    else if (Array.isArray(node)) {
        return (value as any[]).map((i:any) => encode(node[0], i)).join(",");
    }
    else if (node.type === "boolean") return !!value ? "true": "false";
    else if (node.type === "datetime") return formatISO(value);
    else if (node.type === "number") return value.toString();
    else return value;
}

const createMapper = <TQuery>(mapping:QueryStringMapping<TQuery>) => {
    return (queryString:Record<string,string>) => 
        Object.fromEntries(
            Object.entries(mapping)
                .map(([key, value]) => [key, parse(value as any, queryString[key])])
                .filter(([_, value]) => value !== undefined)
        );
}

const createEncoder = <TQuery>(mapping:QueryStringMapping<TQuery>) => {
    return (query:TQuery) => {
        let outcome:Record<string,string> = {}
        for (const key in mapping) {
            outcome[key] = encode(mapping[key], query[key]);
        }
        return outcome;
    }
}

export const useQueryString = <TQuery>(mapping:QueryStringMapping<TQuery>, defaultValue:TQuery):HookResult<TQuery> => {

    const [searchParams, setSearchParams] = useSearchParams();

    const query = useMemo(() => {
        let fromQueryString:Record<string,string> = {};
        searchParams.forEach((value, key) => {
            if (value !== "") {
                fromQueryString[key] = value;
            }
        });  
        return {
            ...defaultValue,
            ...createMapper(mapping)(fromQueryString)
        }
    }, [searchParams.toString()]);
    
    const encoder =  createEncoder(mapping);

    const setQueryString = (change:Partial<TQuery>) => {
        
        setSearchParams(encoder({ ...query, ...change }));
    }

    return [query, setQueryString];
}

export const withUrlSupport = <
    TModel extends EntityModel,
    TReq,
    TName extends keyof TModel,
    TRes extends QueryResults<DenormalizedType<TModel,TName>>>(hook:QueryHook<TModel,TReq,TName,TRes>, mapping:QueryStringMapping<TReq>) => {

    return (initReq:TReq, maxDepth:number = 3):[SQuery<TModel,TReq,TName,TRes>,(req:TReq) => void] => {

        const [req, newQuery] = useQueryString<TReq>(mapping, initReq);

        const [queryState, _] = hook(req, maxDepth);

        return [queryState, newQuery];
    }

}