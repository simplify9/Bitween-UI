import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AccountModel, Tokens} from "src/types/accounts";

type UserSliceState = {
    accessToken: string | undefined;
    refreshToken: string | undefined;
    isLoggedIn: boolean
    userInfo: AccountModel | undefined
    isLoading: false
}


const initialState: UserSliceState = {
    accessToken: undefined,
    refreshToken: undefined,
    isLoggedIn: false,
    userInfo: undefined,
    isLoading: false
}
export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        logout: (state) => {
            state.accessToken = undefined;
            state.refreshToken = undefined;
            state.userInfo = undefined
        },
        setTokens: (state, action: PayloadAction<Tokens>) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.isLoggedIn =
                (action.payload.accessToken && action.payload.refreshToken) !==
                undefined;
        },
        setAccountInfo: (state, action: PayloadAction<AccountModel>) => {
            state.userInfo = action.payload;
        },
        setIsLoading: (state, action: PayloadAction<AccountModel>) => {
            state.userInfo = action.payload;
        },
    }
});

export const {setTokens, logout, setAccountInfo} =
    userSlice.actions;

export default userSlice.reducer;
