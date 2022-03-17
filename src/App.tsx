
import React, {useEffect, useState} from 'react';
import Dashboard from "./components/Dashboard";
import Helmet from 'react-helmet';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {useTranslation} from "react-i18next";
import CookiesManager from "./Utils/CookiesManager";
import {useDispatch, useSelector} from "react-redux";
import IAppStateModel from "./Types/AppState";
import {HideAlert} from "./State/Actions/UiActions";
import Exchanges from './components/Exchanges';
import Subscriptions from './components/Subscriptions';
import NavBar from './components/NavBar';



function App() {

  const {i18n} = useTranslation();
  const alert = useSelector((state: IAppStateModel) => state.alert);
  const isLoading = useSelector((state: IAppStateModel) => state.isLoading);

  const dispatch = useDispatch();

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {

    let storedLocale = CookiesManager.getLocale();
    if (storedLocale !== i18n.language) CookiesManager.setLocale(i18n.language);
    
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
        
        <div className="App">
            
            <Router>
              <NavBar />
              <Routes>
                <Route path="/login" element={<div/>} />
                <Route path="/" element={<Dashboard />}/>
                <Route path="/exchanges" element={<Exchanges />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
              </Routes>
            </Router>
        </div>

      </>
  );
}

export default App;
