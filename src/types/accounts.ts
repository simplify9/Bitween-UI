export const initialState: UserState = {
    name: "",
    isLoading: false,
    isLoggedIn: false
};


export interface UserState {
    name: string;
    isLoading: boolean;
    accessToken?: string;
    refreshToken?: string;
    isLoggedIn: boolean;
}

export type Tokens = {
    accessToken?: string;
    refreshToken?: string;
};

export interface LoginResponse {
    refreshToken: string;
    jwt: string;
}

export interface LoginRequest {
    username?: string;
    password?: string;
    refreshToken?: string;
}

export interface AccountModel {
    name: string
    email: string
    createdOn: string
}

export interface CreateAccountModel {
    name: string
    email: string
    password: string
}

export interface ChangePasswordModel {
    oldPassword: string
    newPassword: string
   
}