import React, { useState,useEffect } from "react";
import "./App.css";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { Login } from "./pages/login";
import { Home } from "./pages/home";
import { ItemDetailPage } from "./pages/itemDetailPage";
import { FaceSearchAndVerification } from "./pages/faceSearchAndVerification";
import { ManageFaceCollection } from "./pages/manageFaceCollection";
import { AddRemoveFaceInCollection } from "./pages/addRemoveFaceInCollection";
import { AuthRoute } from "./api/authRoute";
import { requestHeadersWithJWT } from "./api/apisupport";
import logService from "./log/logService";
import apiClient from "./api/apiClient";
import { ToastContainer, toast } from 'react-toastify';
import { PublicRoute } from "./api/publicRoute";

function App() {
  const [loggedIn, setloggedIn] = useState(false);

  const updateLoggedIn = (value) => {
    setloggedIn(value);
  };

  //Error Notification
  const notifyError = (message) => toast.error(`${message}`, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
  });

  //DB check user status
  const checkUserStatus = async () => {
    const user = localStorage.getItem('user')
    try{
        const response = await apiClient.get("/user/" + user,{
            headers: requestHeadersWithJWT
        })
        console.log(response)
        if (response.status === 200){
          setloggedIn(true)
        }else{
          clearAllValue()
          setloggedIn(false)
          notifyError(`Your session has been expired. Logging out...`)
        }
        return response.data
    }catch(error) {
        logService.log(error)
        clearAllValue()
        setloggedIn(false)
        notifyError(`Your session has been expired. Logging out...`)
        return error.response
    }
  };

  useEffect(() => {
    logService.init()
    const token = localStorage.getItem('jwt-token')
    const user = localStorage.getItem('user')
    if (!token || !user) {
      localStorage.removeItem('jwt-token')
      localStorage.removeItem('user')
      return;
    }
    if (token === '') {
      return;
    }
    setloggedIn(true)
    const checkUserStatusEffect = async () => {
      checkUserStatus()
    }
    checkUserStatusEffect()
  },[])

  const clearAllValue = () => {
    localStorage.removeItem('jwt-token')
    localStorage.removeItem('user')
  };
  
  return (
    <div className="App">
      <ToastContainer />
      <BrowserRouter>
        <Header loggedIn={loggedIn} callbackLoginFunc={updateLoggedIn} />
        <Switch>
          <PublicRoute
            path="/"
            callbackLoginFunc={updateLoggedIn}
            exact
          />
          <AuthRoute path="/home" component={Home} exact />
          <AuthRoute
            path="/face-search-verification"
            component={FaceSearchAndVerification}
            exact
          />
          <AuthRoute
            path="/face-search-verification/manage-face-collection"
            component={ManageFaceCollection}
            exact
          />{" "}
          <AuthRoute
            path="/face-search-verification/add-remove-face-in-collection"
            component={AddRemoveFaceInCollection}
            exact
          />
          <AuthRoute path="/face-search-verification/search-face-by-image" component={ItemDetailPage} exact />
          <AuthRoute path="/:itemkey" component={ItemDetailPage} exact />
        </Switch>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
