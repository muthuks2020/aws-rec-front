import './../assets/styles/login.scss'
import { Button } from './../components/button'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../api/apiClient';
import { useState, useEffect } from "react";
import logService from "../log/logService";
import { Modal } from "react-bootstrap";
import { primaryColor } from '../assets/colors';
import { ScaleLoader } from 'react-spinners';
import { css } from "@emotion/react";
import { useHistory } from 'react-router';
import logo from './../assets/images/codablexLogo.svg'

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

export const Login = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const history = useHistory();
    
    //Success Notification
    const notifySuccess = (message) => toast.success(`${message}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

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

    //DB Login or create request
    const loginRequest = async () =>{
        if (username === ""){
            notifyError(`User name can't be empty`)
            return
        }else if (username.length < 5){
            notifyError(`User name can't be less than 5 characters`)
            return
        }else if (password === ""){
            notifyError(`Password can't be empty`)
            return
        }else if (password.length < 8){
            notifyError(`Password can't be less than 8 characters`)
            return
        }
        let rawData = {
            "username":username,
            "password":password
        }
        try{
            setLoading(true)
            const response = await apiClient.post("/users/login",rawData,{
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            setLoading(false)
            //console.log(response)
            if (response.status === 200){
                props.callbackLoginFunc(true)
                notifySuccess(`Successfully logged in.`)
                localStorage.setItem("jwt-token",response.data.token)
                localStorage.setItem("user",response.data.user._id)
                history.push(`/home`);
            }else if (response.status === 201){
                props.callbackLoginFunc(true)
                notifySuccess(`Account created success.`)
                localStorage.setItem("jwt-token",response.data.token)
                localStorage.setItem("user",response.data.user._id)
                history.push(`/home`);
            }else{
                notifyError(`response.status ${response.status} Error add collection in local database`)
            }
            return response.data
        }catch(error) {
            setLoading(false)
            logService.log(error)
            notifyError(`${error.message}`)
            if (error.response) {
                // Request made and server responded
                // console.log(error.response.data);
                // console.log(error.response.status);
                // console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                // console.log('Error', error.message);
            }
            return error.response
        }
    };


    //DB Check account status
    const accountCreateOrLoginCheck = async () =>{
        try{
            setLoading(true)
            const response = await apiClient.get("/usercount",{
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            setLoading(false)
            //console.log(response)
            if (response.status === 200){
                if (response.data.userCount > 0){
                    setIsLogin(true)
                }else{
                    setIsLogin(false)
                }
            }else{
                notifyError(`response.status ${response.status} Error add collection in local database`)
            }
            return response.data
        }catch(error) {
            setLoading(false)
            logService.log(error)
            notifyError(`${error}`)
            if (error.response) {
                // Request made and server responded
                // console.log(error.response.data);
                // console.log(error.response.status);
                // console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                // console.log('Error', error.message);
            }
            return error.response
        }
    };

    useEffect(() => {
        accountCreateOrLoginCheck();
    },[])

    //callbackLoginFunc={props.callbackLoginFunc}

    return (
        <div className="login-main-div">
            <ToastContainer />
            <p>
                <img src={logo} width="300px" alt='logo'/>
            </p>
            <p>A Powerfull AWS Rekognition Service Application</p>
            <p>{isLogin === true ? 'Login' : 'Create an account'}</p>
            <input className="input-field" placeholder="User Name" onChange={(e) => { setUsername(e.target.value)} }/>
            <input type="password" className="input-field" placeholder="Password" onChange={(e) => { setPassword(e.target.value)} }/>
            <Button text={isLogin === true ? 'Login' : 'Create'} path="/home" onClick={loginRequest} /> 

            <Modal show={loading} centered>
                <div className="d-flex flex-column align-items-center">
                <ScaleLoader color={primaryColor} loading={loading} css={override} size={150} />
                <div>
                <p>Loading...</p>
                </div>
                </div>
            </Modal>
        </div>
    )
}