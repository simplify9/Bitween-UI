import {useEffect, useState} from "react";

export interface QueryState<TReq, TRes> {
    lastSent: TReq
    lastHandled: Partial<TReq>
    isFetching: boolean
    response: TRes | null
    error: any
}


export interface UseQueryOptions<TReq, TRes> {
    fetcher: (req: TReq) => Promise<TRes>
}

export type QueryReturnType<TReq, TRes> = [QueryState<TReq, TRes>, (req: TReq) => void]

export type QueryHook<TReq, TRes> = (req: TReq) => QueryReturnType<TReq, TRes>

export const queryHook = <TReq, TRes>({
                                          fetcher,
                                      }: UseQueryOptions<TReq, TRes>): QueryHook<TReq, TRes> =>
    (req: TReq): QueryReturnType<TReq, TRes> => {

        const [state, setState] = useState<QueryState<TReq, TRes>>({
            lastHandled: {},
            lastSent: req,
            response: null,
            error: null,
            isFetching: true
        });

        const send = (req: TReq) => {


            setState(s => ({
                ...s,
                isFetching: true,
                lastSent: req,
                error: null
            }));

            fetcher(req)
                .then(res => {
                    setState(s => req === s.lastSent
                        ? ({
                            ...s,
                            isFetching: false,
                            response: res,
                            lastHandled: req
                        })
                        : s);
                })
                .catch(err => {
                    setState(s => req === s.lastSent
                        ? ({
                            ...s,
                            isFetching: false,
                            response: null,
                            error: err,
                            lastHandled: req
                        })
                        : s);
                });

        }

        useEffect(() => {
            send(req);
        }, [...Object.values(req as any)]);


        return [state, send];
    }




