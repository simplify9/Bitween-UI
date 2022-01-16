import CookiesManager from "../../Utils/CookiesManager";
import IAction from "../../Types/Action";
import * as ActionTypes from '../ActionTypes';
// import jwt from "jsonwebtoken";

export const SetProfile = (jwtToken: string): IAction => {
   // const info = jwt.decode(jwtToken)! as { [k: string]: any };
    CookiesManager.setAccessToken(jwtToken);
    return {
        type: ActionTypes.SET_PROFILE,
        // payload: {
        //     id: info['nameid'],
        //     name: info['given_name'],
        //     role: info['Role'],
        //     email: info['email']
        // }
        payload: {
            id: "",
            name: "info['given_name']",
            role: "info['Role']",
            email: "info['email']"
        }
    }
}

export const Logout = (): IAction => {
    CookiesManager.deleteAllCookies();
    return {
        type: ActionTypes.DELETE_PROFILE,
        payload: {}
    }
}
