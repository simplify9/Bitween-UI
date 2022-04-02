import Dashboard from "./components/Dashboard";
import Helmet from 'react-helmet';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Exchanges from './components/Exchanges';
import Subscriptions from './components/Subscriptions';
import NavBar from './components/NavBar';



function App() {

  
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
