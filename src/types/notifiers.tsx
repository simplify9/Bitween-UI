import {BaseSearchModel, KeyValuePair} from "src/types/common";

export type NotifierModel = {
    id: number;
    name: string;
    runOnSuccessfulResult: boolean | null;
    runOnBadResult: boolean | null;
    runOnFailedResult: boolean | null;
    handlerId: string;
    inactive: boolean | null;

    handlerProperties?: KeyValuePair[];

    runOnSubscriptions: RunOnSubscriptionsModel[]

}

type RunOnSubscriptionsModel = {

    id: number
    name?: string
}

export interface NotifiersSearchModel extends BaseSearchModel {

}