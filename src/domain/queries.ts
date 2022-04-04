import { queryHook } from "../redux-cq"
import model from "./model"


type ExchangeFindQuery = {
    exchangeId: string
}

export const useExchangeFinder = queryHook(model, "exchange", (req:ExchangeFindQuery) => {
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