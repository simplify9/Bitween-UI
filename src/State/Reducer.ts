import { combineReducers } from "redux";
import { model } from "../entityModel";
import { createEcqReducer, ECQ_REDUCER_KEY } from "redux-ecq";

const appReducer = combineReducers({
    [ECQ_REDUCER_KEY]: createEcqReducer(model)
});

export default appReducer;
