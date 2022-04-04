import { combineReducers } from "redux";
import model from "../domain/model";
import { createCqReducer, CQ_REDUCER_KEY } from "../redux-cq";

const appReducer = combineReducers({
    [CQ_REDUCER_KEY]: createCqReducer(model)
});

export default appReducer;
