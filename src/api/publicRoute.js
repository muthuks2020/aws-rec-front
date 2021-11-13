import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Login } from '../pages/login';

export const PublicRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        !localStorage.getItem('jwt-token')
            ? <Login callbackLoginFunc={rest.callbackLoginFunc} />
            : <Redirect to={{ pathname: '/home', state: { from: props.location } }} />
    )} />
)