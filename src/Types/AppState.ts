import IProfile from "./Profile";


interface IAppStateModel{
    alert: IAlertModel
    isLoading: boolean
    profile?: IProfile
}

export default IAppStateModel;

export type SeverityType = "error" | "success" | undefined

export interface IAlertModel {
    severity?: SeverityType
    open: boolean
    message?: string
}
