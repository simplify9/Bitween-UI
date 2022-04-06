import { combineReducers } from "redux";
import { model } from "../entityModel";
import { createCqReducer, CQ_REDUCER_KEY } from "../redux-cq";

const appReducer = combineReducers({
    [CQ_REDUCER_KEY]: createCqReducer(model)
});

export default appReducer;
