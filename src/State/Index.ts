import { createStore,applyMiddleware } from 'redux';
import logger from "redux-logger";
import { composeWithDevTools } from 'redux-devtools-extension';
import AppReducer from './Reducer';


const store = createStore(AppReducer, composeWithDevTools(
    applyMiddleware(logger),
    // other store enhancers if any
));
export default store
