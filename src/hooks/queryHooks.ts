import { queryHook } from "../redux-cq"
import { model } from "../entityModel"


export type ExchangeFindQuery = {
    mode: string
    subscription?: string
    status?: string
    keywords?: string
    creationDateFrom?: string
    creationDateTo?: string
    offset: number
    limit: number
    sortBy: string
    sortByDescending: boolean
}

export const useExchangeFinder = queryHook(model, "exchange", (req:ExchangeFindQuery) => {
    return Promise.resolve({
        offset: 0,
        total: 2,
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
            },
            {
                id: "ex2",
                createdOn: new Date(),
                tags: ["parcelId:111", "fasdfdseee"],
                subscription: { 
                    id: "sub1",
                    desc: "First Subscription",
                    createdOn: new Date()
                }
            }  
        ]
    })
})