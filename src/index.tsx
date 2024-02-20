import React from 'react';
import "./index.css";

import App from './App';
import {client} from './client'
import {addAxiosInterceptors} from "./client/api";
import AuthConfig from "./authConfig";
import {AuthApiProvider} from "./client/components";
import {createRoot} from 'react-dom/client';
import {Provider} from "react-redux";
import {store} from "src/state/ReduxSotre";
import ENV from "src/env";

addAxiosInterceptors(client, AuthConfig);
client.defaults.baseURL = ENV.API_BASE_URL;

const container = document.getElementById("root") as Element;

const root = createRoot(container!);

root.render(
    <Provider store={store}>
        <AuthApiProvider authApp={AuthConfig}>
            <App/>
        </AuthApiProvider>
    </Provider>
);