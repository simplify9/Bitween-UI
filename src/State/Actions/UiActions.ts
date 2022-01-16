import * as ActionsTypes from '../ActionTypes';
import IAction from "../../Types/Action";
import {SeverityType} from "../../Types/AppState";



export const SetIsLoading = (isLoading: boolean): IAction => {

    return {
        type: ActionsTypes.SET_IS_LOADING,
        payload: {
            isLoading
        }
    }
}

export const ShowAlert = (message: string, severity?: SeverityType): IAction => {

    return {
        type: ActionsTypes.SET_ALERT,
        payload: {
            severity: severity ?? 'success',
            open: true,
            message
        }
    }
}

export const HideAlert = (): IAction => {

    return {
        type: ActionsTypes.SET_ALERT,
        payload: {
            open: false
        }
    }
}
