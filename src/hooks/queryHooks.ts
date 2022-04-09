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
        total: 2,
        results: [
            {
                id: "ex1",
                createdOn: new Date(),
                tags: ["parcelId:333", "fasdfa"],
                documentUrl: "https://document.com/123",
                documentType: {
                    id: "parcelInfo",
                    desc: "Parcel Info"
                },
                subscription: { 
                    id: "sub1",
                    desc: "DHL Drop-in Folder",
                    createdOn: new Date()
                }
            },
            {
                id: "ex2",
                createdOn: new Date(),
                tags: ["parcelId:111", "fasdfdseee"],
                documentUrl: "https://document.com/234",
                documentType: {
                    id: "invoice",
                    desc: "Invoice"
                },
                subscription: { 
                    id: "sub2",
                    desc: "My 2nd Subscription",
                    createdOn: new Date()
                }
            }  
        ]
    })
})

export type SubscriptionFindQuery = {
    id?: string
    nameLike?: string
    offset: number
    limit: number
    sortBy: string
    sortByDescending?: boolean
}

export const useSubscriptionFinder = queryHook(model, "subscription", (req:SubscriptionFindQuery) => {

    return Promise.resolve({
        total: 10,
        results: [
            {
                id: "sub1",
                desc: "DHL Drop-in Folder",
                createdOn: new Date()
            },
            {
                id: "sub2",
                desc: "My 2nd Subscription",
                createdOn: new Date()
            },
            {
                id: "sub3",
                desc: "My 3rd Subscription",
                createdOn: new Date()
            },
            {
                id: "sub4",
                desc: "My First Subscription",
                createdOn: new Date()
            },
            {
                id: "sub5",
                desc: "Test Subscription",
                createdOn: new Date()
            },
            {
                id: "sub6",
                desc: "Another Test Subscription",
                createdOn: new Date()
            }
        ]
    })

});