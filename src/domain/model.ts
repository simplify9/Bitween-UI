import { jsEntity, jsString, jsDateTime, jsRef } from "../redux-cq";

export default {

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