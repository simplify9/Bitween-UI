import './Styles/globals.css'
import React, {useEffect, useState} from 'react';
import './App.css';
import {CssBaseline, ThemeProvider} from '@material-ui/core';
import {jssPreset, StylesProvider} from "@material-ui/styles";
import theme from './Theme';
import Helmet from 'react-helmet';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {useTranslation} from "react-i18next";
import AnonymousLayout from "./Components/Layouts/AnonymousLayout";
import LoggedInLayout from "./Components/Layouts/LoggedInLayout";
import CookiesManager from "./Utils/CookiesManager";
import SnackBar from "./Components/Shared/SnackBar";
import {useDispatch, useSelector} from "react-redux";
import IAppStateModel from "./Types/AppState";
import {HideAlert} from "./State/Actions/UiActions";
import {SetBaseUrl, SetClientConfig} from "@simplify9/simplyapiclient";
import Config from './config';
import {Logout} from "./State/Actions/ProfileActions";
import rtl from 'jss-rtl';
import {create} from 'jss';

const jss = create({plugins: [...jssPreset().plugins, rtl()]});


function App() {

  const {i18n} = useTranslation();
  const alert = useSelector((state: IAppStateModel) => state.alert);
  const isLoading = useSelector((state: IAppStateModel) => state.isLoading);

  const dispatch = useDispatch()

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {

    let storedLocale = CookiesManager.getLocale();
    if (storedLocale !== i18n.language) CookiesManager.setLocale(i18n.language);
    SetClientConfig({
      baseUrl:`${Config.baseUrl}`,
      authType: "bearer",
      getBearer: () => CookiesManager.getAccessToken(),
      onAuthFail: () => dispatch(Logout()),
    });
    setLoaded(true);
  })

  useEffect(() => {
    if (alert.open) {
      setTimeout(() => {
        dispatch(HideAlert())
      }, 7429)
    }

  }, [alert.open])

  if (!loaded) return <></>
  return (
      <>
        <Helmet>
          <title>Infolink</title>
        </Helmet>
        <StylesProvider injectFirst>

          <ThemeProvider theme={theme(i18n.language.slice(0, 2).toLowerCase() === "ar" ? "rtl" : "ltr")}>

            <div className="App" dir={i18n.language.slice(0, 2).toLowerCase() === "ar" ? "rtl" : "ltr"}>
              <StylesProvider jss={jss}>
                <CssBaseline/>
                <SnackBar open={alert.open} severity={alert.severity} message={alert.message}/>
                <Router>
                  <Routes>
                    <Route path="/login" element={<AnonymousLayout/>}>
                    </Route>
                    <Route path="/" element={<LoggedInLayout/>}/>
                  </Routes>
                </Router>
              </StylesProvider>
            </div>

          </ThemeProvider>
        </StylesProvider>
      </>
  );
}

export default App;
