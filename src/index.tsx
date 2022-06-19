import React from 'react';
import ReactDOM from 'react-dom';
import "./index.css";
import App from './App';
import {Provider} from "react-redux";
import store from "./State/Index";
import {SessionStorage} from "./client/repos";
import {client} from './client'
import {addAxiosInterceptors} from "./client/api";
import {API_BASE_URL} from "./env";
import AuthConfig from "./authConfig";
import { AuthApiProvider } from "./client/components";


addAxiosInterceptors(client,AuthConfig);
client.defaults.baseURL = API_BASE_URL;


ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <AuthApiProvider authApp={AuthConfig}>
                <App/>
            </AuthApiProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

