declare global {
    interface ImportMeta {
        env: {
            VITE_ApiBaseUrl: string;
            // add other environment variables here
        }
    }
}
export const API_BASE_URL = import.meta.env.VITE_ApiBaseUrl ?? "/api/";
//export const API_BASE_URL = "https://localhost:5001/api/"
//export const API_BASE_URL = "https://infolink.sf9.io/API/"

