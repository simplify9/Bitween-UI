import React from 'react';
import "./index.css";

import App from './App';
import {client} from './client'
import {addAxiosInterceptors} from "./client/api";
import {API_BASE_URL} from "./env";
import AuthConfig from "./authConfig";
import {AuthApiProvider} from "./client/components";
import {createRoot} from 'react-dom/client';
import {Provider} from "react-redux";
import {store} from "src/state/ReduxSotre";

addAxiosInterceptors(client, AuthConfig);
client.defaults.baseURL = API_BASE_URL;


const container = document.getElementById("root") as Element;
const root = createRoot(container!);
root.render(<AuthApiProvider authApp={AuthConfig}>
    <Provider store={store}>
        <App/>
    </Provider>
</AuthApiProvider>);