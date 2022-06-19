import Dashboard from "./components/Dashboard";
import Helmet from 'react-helmet';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Exchanges from './components/Exchanges';
import Subscriptions from './components/Subscriptions';
import NavBar from './components/NavBar';
import {useAuthApi} from "./client/components";
import Login from "./components/Login";
import Documents from "./components/Documents";
import Partners from "./components/Partners";
import Partner from "./components/Partner";
import Subscription from "./components/Subscription";
import Document from "./components/Document";


function App() {

    const { isLoggedIn } = useAuthApi();

    if (!isLoggedIn) return <Login />
  return (
      <>
        <Helmet>
          <title>Infolink</title>
        </Helmet>

        <div>

            <Router>
              <NavBar />
              <Routes>

                <Route path="/" element={<Dashboard />}/>
                <Route path="/exchanges" element={<Exchanges />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/documents" element={<Documents />} />
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/partners/:id" element={<Partner />} />
                  <Route path="/documents/:id" element={<Document />} />
                  <Route path="/subscriptions/:id" element={<Subscription />} />
              </Routes>
            </Router>

        </div>

      </>
  );
}

export default App;
