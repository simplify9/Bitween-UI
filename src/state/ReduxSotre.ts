import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {userSlice} from "src/state/stateSlices/user";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {NotifiersApi} from "src/client/apis/notifiersApi";
import {SubscriptionApi} from "src/client/apis/subscriptionsApi";
import {XchangeApi} from "src/client/apis/xchangeApi";
import {GeneralApi} from "src/client/apis/generalApi";
import {GlobalAdapterValuesSetsApi} from "src/client/apis/globalAdapterValuesSetsApi";
import {ApiGatewaysApi} from "src/client/apis/apiGatewaysApi";
import {BusGatewaysApi} from "src/client/apis/busGatewaysApi";
import {MappersApi} from "src/client/apis/mappersApi";
import {PartnersApi} from "src/client/apis/partnersApi";
import {AmqpHealthApi} from "src/client/apis/amqpHealthApi";
import {RetryPoliciesApi} from "src/client/apis/retryPoliciesApi";
import {DelayedRetriesApi} from "src/client/apis/delayedRetriesApi";
import {themeSlice} from "src/state/stateSlices/theme";
import {featuresSlice} from "src/state/stateSlices/features";

const reducers = combineReducers({
    user: userSlice.reducer,
    theme: themeSlice.reducer,
    features: featuresSlice.reducer,
    [NotifiersApi.reducerPath]: NotifiersApi.reducer,
    [SubscriptionApi.reducerPath]: SubscriptionApi.reducer,
    [XchangeApi.reducerPath]: XchangeApi.reducer,
    [GeneralApi.reducerPath]:GeneralApi.reducer,
    [GlobalAdapterValuesSetsApi.reducerPath]: GlobalAdapterValuesSetsApi.reducer,
    [ApiGatewaysApi.reducerPath]: ApiGatewaysApi.reducer,
    [BusGatewaysApi.reducerPath]: BusGatewaysApi.reducer,
    [MappersApi.reducerPath]: MappersApi.reducer,
    [PartnersApi.reducerPath]: PartnersApi.reducer,
    [AmqpHealthApi.reducerPath]: AmqpHealthApi.reducer,
    [RetryPoliciesApi.reducerPath]: RetryPoliciesApi.reducer,
    [DelayedRetriesApi.reducerPath]: DelayedRetriesApi.reducer,

});


export const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({}).concat([
            NotifiersApi.middleware,
            SubscriptionApi.middleware,
            XchangeApi.middleware,
            GeneralApi.middleware,
            GlobalAdapterValuesSetsApi.middleware,
            ApiGatewaysApi.middleware,
            BusGatewaysApi.middleware,
            MappersApi.middleware,
            PartnersApi.middleware,
            AmqpHealthApi.middleware,
            RetryPoliciesApi.middleware,
            DelayedRetriesApi.middleware,
        ])
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
