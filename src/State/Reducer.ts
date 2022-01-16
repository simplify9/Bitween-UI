import * as ActionsTypes from './ActionTypes';
import InitialState from './InitialState';
import IAppStateModel from '../Types/AppState';

const appReducer = (state = InitialState, action: any): IAppStateModel => {
    switch (action.type) {

        //UI Actions
        case ActionsTypes.SET_IS_LOADING:
            return {
                ...state,
                isLoading: action.payload.isLoading
            }
        case ActionsTypes.SET_ALERT:
            return {
                ...state,
                alert: action.payload
            }




        //Profile Actions
        case ActionsTypes.SET_PROFILE:
            return {
                ...state,
                profile: action.payload
            }
        case ActionsTypes.DELETE_PROFILE:
            return {
                ...state,
                profile: undefined
            }
        default:
            return state;


    }
}

export default appReducer;
