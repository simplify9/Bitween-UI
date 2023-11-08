declare global {
    interface ImportMeta {
        env: {
            VITE_ApiBaseUrl: string;
            VITE_MSAL_CLIENT_ID: string;
            // add other environment variables here
        }
    }
}

export const default_base_url = "https://localhost:5001/api/"
//export const default_base_url = "/api/"

export const MSAL_CLIENT_ID = import.meta.env.VITE_MSAL_CLIENT_ID 
export const API_BASE_URL = import.meta.env.VITE_ApiBaseUrl ?? default_base_url;
//export const API_BASE_URL = "https://localhost:5001/api/"

