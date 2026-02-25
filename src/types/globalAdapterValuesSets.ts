import {BaseSearchModel} from "src/types/common";

export type GlobalAdapterValuesSetModel = {
    id: string;
    name: string;
    values: { [key: string]: string };
}

export type GlobalAdapterValuesSetCreate = {
    id: string;
    name: string;
    values: { [key: string]: string };
}

export type GlobalAdapterValuesSetUpdate = {
    name: string;
    values: { [key: string]: string };
}

export interface GlobalAdapterValuesSetsSearchModel extends BaseSearchModel {
}
