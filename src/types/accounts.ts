


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
    username: string;
    password: string;
    refreshToken?:string;
}
