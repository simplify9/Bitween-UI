import {BaseSearchModel} from "src/types/common";

export type NotifierModel = {
    id: number;
    name: string;
    runOnSuccessfulResult: boolean | null;
    runOnBadResult: boolean | null;
    runOnFailedResult: boolean | null;
    handlerId: string;
    inactive: boolean | null;
}

export interface NotifiersSearchModel extends BaseSearchModel {

}