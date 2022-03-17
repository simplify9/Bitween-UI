import React from 'react';
import ReactDOM from 'react-dom';
import "./index.css";
import App from './App';
import {I18nextProvider} from "react-i18next";
import i18n from "./Utils/I18n";
import {Provider} from "react-redux";
import store from "./State/Index";

ReactDOM.render(
    <React.StrictMode>
        <I18nextProvider i18n={i18n}>
            <Provider store={store}>
                <App/>
            </Provider>
        </I18nextProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

