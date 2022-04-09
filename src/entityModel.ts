import { jsEntity, jsString, jsDateTime, jsRef, TypeOf } from "./redux-cq";

export const model = {

    exchange: jsEntity({
            id: jsString(),
            createdOn: jsDateTime(),
            tags: [ jsString() ],
            documentType: jsRef("documentType"),
            documentUrl: jsString(),
            subscription: jsRef("subscription")
        }, "id"),

    subscription: jsEntity({
            id: jsString(),
            createdOn: jsDateTime(),
            desc: jsString()
        }, "id"),
    
    documentType: jsEntity({
            id: jsString(),
            desc: jsString()
        }, "id")
} 

export type Exchange = TypeOf<typeof model,"exchange">;

export type Subscription = TypeOf<typeof model,"subscription">;

export type DocumentType = TypeOf<typeof model, "documentType">;