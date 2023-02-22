import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {userSlice} from "src/state/stateSlices/user";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {NotifiersApi} from "src/client/apis/notifiersApi";

const reducers = combineReducers({
    user: userSlice.reducer,
    [NotifiersApi.reducerPath]: NotifiersApi.reducer

});


export const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({}).concat([NotifiersApi.middleware])
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
