import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from './Components/Auth/Login/Login';
import Register from './Components/Auth/Register/Register';
import Header from './Components/Header/Header';
import NotFound from "./Components/PageNotFound/NotFound";
import { useEffect, useState, type JSX } from 'react';
import { tokenValid } from './Services/authApi';
import Home from './Components/HomePage/Home/Home';
import type { User } from './Types/userType';

function App() {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [user, setUser] = useState<User>({id:"", firstname:"", lastname:"", email:"", isadmin:false});

  const checkAuth = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setIsLogged(false);
      setUser({id:"", firstname:"", lastname:"", email:"", isadmin:false});
      return;
    }

    tokenValid(token).then((userInfo) => {
      setIsLogged(true);
      setUser({ ...userInfo });

    }).catch(() => {
      setIsLogged(false);
      setUser({id:"", firstname:"", lastname:"", email:"", isadmin:false});
      sessionStorage.removeItem("token");
    });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const requireAuth = (element: JSX.Element) => {
    if(isLogged === null) return <></>;
    return isLogged ? element : <Navigate to="/login" replace />;
  };
  
  const redirectIfLogged = (element: JSX.Element) => {
    if(isLogged === null) return <></>;
    return isLogged ? <Navigate to="/home"/> : element;
  }

  return (
    <>
      <Header isLogged={isLogged} setIsLogged={setIsLogged} user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={redirectIfLogged(<Navigate to="/login" />)} />

        <Route path="/login" element={redirectIfLogged(<Login setIsLogged={setIsLogged} setUser={setUser} />)} />
        <Route path="/register" element={redirectIfLogged(<Register setIsLogged={setIsLogged} setUser={setUser} />)} />
        <Route path="/home" element={requireAuth(<Home user={user}/>)} />
        <Route path="*" element={<NotFound />} />
      </Routes>

    </>
  )
}

export default App;
