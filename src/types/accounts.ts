import {OptionType} from "src/types/common";

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

export type Role = "Admin" | "Member" | "Viewer"
export const RolesSelection: OptionType[] = [
    {
        id: "0",
        title: "Admin"
    },
    {
        id: "10",
        title: "Viewer"
    },
    {
        id: "20",
        title: "Member"
    },
]


export interface AccountModel {
    name: string
    email: string
    createdOn: string
    id: number
    role: Role
}

export interface EditModal {
    name: string
    id: number
    role: number
}

export interface CreateAccountModel {
    name: string
    email: string
    password: string
    role: number
}

export interface ChangePasswordModel {
    oldPassword: string
    newPassword: string
    newPasswordConfirmation: string

}
