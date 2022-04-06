import { queryHook, commandHook, withUrlSupport } from "./hookApi";
import { jsEntity, jsRef, jsBoolean, jsNumber, jsDateTime, jsString, CQ_REDUCER_KEY, Denormalized, EntityModel } from "./core";
import { createCqReducer } from "./reducers";

export type TypeOf<TModel extends EntityModel,TName extends keyof TModel> = Denormalized<TModel,TModel[TName]["props"]>

export { 
    queryHook, 
    withUrlSupport,
    commandHook, 
    jsEntity, 
    jsRef, 
    jsBoolean, 
    jsNumber, 
    jsDateTime, 
    jsString, 
    CQ_REDUCER_KEY,
    createCqReducer 
};