import { jsObject, jsEntity, jsString, jsDateTime, jsRef, DenormalizedType } from "redux-ecq";


export const model = {

    exchange: jsEntity({
            id: jsString(),
            createdOn: jsDateTime(),
            tags: [ jsString() ],
            status: jsString(),
            documentType: jsRef("documentType"),
            promotedProps: jsObject(),
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

export type Exchange = DenormalizedType<typeof model,"exchange">;

export type Subscription = DenormalizedType<typeof model,"subscription">;

export type DocumentType = DenormalizedType<typeof model, "documentType">;