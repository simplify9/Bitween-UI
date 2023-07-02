import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {userSlice} from "src/state/stateSlices/user";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {NotifiersApi} from "src/client/apis/notifiersApi";
import {SubscriptionApi} from "src/client/apis/subscriptionsApi";
import {XchangeApi} from "src/client/apis/xchangeApi";
import {GeneralApi} from "src/client/apis/generalApi";

const reducers = combineReducers({
    user: userSlice.reducer,
    [NotifiersApi.reducerPath]: NotifiersApi.reducer,
    [SubscriptionApi.reducerPath]: SubscriptionApi.reducer,
    [XchangeApi.reducerPath]: XchangeApi.reducer,
    [GeneralApi.reducerPath]:GeneralApi.reducer

});


export const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({}).concat([
            NotifiersApi.middleware,
            SubscriptionApi.middleware,
            XchangeApi.middleware,
            GeneralApi.middleware
        ])
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
