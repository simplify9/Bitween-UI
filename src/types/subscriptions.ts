import {CommonFindQuery, KeyValuePair, OptionType} from "./common";


export type SubscriptionFindQuery = CommonFindQuery & {
  nameContains: string
}

export interface ISubscription {
  id?: string
  name?: string;
  documentId?: string;
  partnerId?: string;
  aggregationForId?: string;
  type?: string
  documentName?: string;
  isRunning?: boolean;
  handlerId?: string;
  mapperId?: string;
  receiverId?: string;
  validatorId?: string;
  temporary?: boolean;
  handlerProperties?: any[];
  validatorProperties?: any[];
  mapperProperties?: any[];
  receiverProperties?: any[];
  inactive?: boolean;
  schedules?: Array<ScheduleView>;
  responseSubscriptionId?: number | null;
  responseMessageTypeName?: string;
  receiveOn?: string | null;
  aggregateOn?: string | null;
  consecutiveFailures?: number;
  lastException?: string;
  aggregationTarget?: string;
  pausedOn?: string | null;
  documentFilter?: Array<KeyValuePair>
}

export interface ScheduleView {
  recurrence: string;
  days: number;
  hours: number;
  minutes: number;
  backwards: boolean;
  id: number
}

export interface ICreateSubscription {
  type?: string;
  name?: string;
  documentId?: string;
  partnerId?: string;
  aggregationForId?: string;
}


export const SubscriptionTypeOptions: OptionType[] = [{
  id: "0",
  title: "Unknown"
},
  { id: "1", title: "Internal" },
  { id: "2", title: "ApiCall" },
  { id: "4", title: "Receiving" },
  { id: "8", title: "Aggregation" }]

export interface AdapterFindQuery {
  prefix: string;
}

