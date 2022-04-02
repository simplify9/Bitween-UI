import { Dispatch, useEffect, useState } from "react"
import { shallowEqual, useDispatch } from "react-redux"
import { querySuccess, queryRun, viewUnmount, dataSync } from "./actions"
import { QueryResponse, useCqSelector, EntityModel, Denormalized, jsString, jsRef, jsEntity, jsDateTime, ChangeReport, ErrorType } from "./core"


type AsyncQueryHandler<TReq,TData> = (req:TReq) => Promise<QueryResponse<TData>>

type SViewSummary<TModel extends EntityModel,TReq,TEntityName extends keyof TModel> = {
    data: Denormalized<TModel,TModel[TEntityName]>[]
    total: number
    pending: boolean
    lastError: string | null
    lastErrorType: ErrorType | null
    lastCreatedReq: TReq
    lastHandledReq: Partial<TReq>
} 
  
let __seq = 0;
const nextId = () => ++__seq;

export const queryHook = <
    TModel extends EntityModel,
    TReq,
    TName extends keyof TModel,
    TProps extends TModel[TName]["props"],
    TData extends Denormalized<TModel,TProps>>(
    entityModel:TModel, 
    entityName:TName, 
    handler:AsyncQueryHandler<TReq,TData>) => {

        const createFetcher = (viewSeq:string, dispatch:Dispatch<any>, maxDepth:number) =>
            (req:TReq) => {
                dispatch(queryRun(req, viewSeq, entityName as string, maxDepth));
                handler(req)
                    .then(res => {
                        //const [entities, results] = normalize(entityModel, entityName, res.results);
                        //const normalizedResponse = { ...res, results }
                        dispatch(querySuccess(viewSeq, req, entityName, maxDepth, res.results, res.total));
                        
                    }); 
            }
    
        const initViewState = (req:TReq) => ({
            data: [],
            pending: true,
            lastError: null,
            lastErrorType: null,
            total: 0,
            lastCreatedReq: req,
            lastHandledReq: {}
        })

        return (initReq:TReq, maxDepth:number = 2):[SViewSummary<TModel,TReq,TName>,(req:TReq) => void] => {
            const [viewSeq, _] = useState(nextId().toString());
            const sView = useCqSelector(s => s.views[viewSeq] as SViewSummary<TModel,TReq,TName> || initViewState(initReq), shallowEqual);
            const dispatch = useDispatch();

            // view mounting / unmounting
            const fetcher = createFetcher(viewSeq, dispatch, maxDepth);
            useEffect(() => {
                fetcher(initReq);
                return () => {
                    dispatch(viewUnmount(viewSeq));
                }
            }, []);

            return [sView, fetcher];
        }
    
}

type CommandResponse<TPayload> = TPayload

type CommandHandler<TCommand,TRes> = (params:TCommand) => Promise<CommandResponse<TRes>>

interface WithUpdates<TModel extends EntityModel,TRes> {
    updates?: Partial<ChangeReport<TModel>>
    result?: TRes
}

export const commandHook = <
    TModel extends EntityModel,
    TCommand,
    TRes>(entityModel:TModel, handler:CommandHandler<TCommand,WithUpdates<TModel,TRes>>) => {

        return () => {
            const dispatch = useDispatch();

            return (params:TCommand) => {
                handler(params)
                    .then(({ result, updates = { } }) => {

                        dispatch(dataSync({
                            modified: { },
                            created: { },
                            deleted: { },
                            ...updates
                        }));

                        return result;
                    })
            }
        }
}





// test

type ExchangeFindQuery = {
    exchangeId: string
}
 
interface SubscriptionFindQuery {
    subscriptionId: string

}
  
const entities = {

    exchange: jsEntity({
            id: jsString(),
            createdOn: jsDateTime(),
            tags: [ jsString() ],
            subscription: jsRef("subscription")
        }, "id"),

    subscription: jsEntity({
            id: jsString(),
            createdOn: jsDateTime(),
            desc: jsString()
        }, "id")
        
} 

const useExchangeFinder = queryHook(entities, "exchange", (req:ExchangeFindQuery) => {
    return Promise.resolve({
        offset: 0,
        total: 1,
        results: [
            {
                id: "ex1",
                createdOn: new Date(),
                tags: ["parcelId:333", "fasdfa"],
                subscription: { 
                    id: "sub1",
                    desc: "First Subscription",
                    createdOn: new Date()
                }
            } 
        ]
    })
})


const [queryState, find] = useExchangeFinder({ exchangeId: "234" })

useEffect(() => {
    find({ exchangeId: "123" })
})

export { }

