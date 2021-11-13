import logo from './../assets/images/xRekognition.png'
import { Link } from 'react-router-dom';
import './../assets/styles/header.scss'

import { Button } from './button'

export const Header = (props) => {
    const logout = () => {
        localStorage.removeItem('jwt-token')
        localStorage.removeItem('user')
        props.callbackLoginFunc(false)
    }

    //"button-links-single" or button-links
    return (
        <div className="top-navbar">
            <Link to="/home"><img className="logo-img" src={logo} alt='logo'/></Link>
            <div className="button-links-single">
                {
                    (props.loggedIn) ? (
                        <Button text='Logout' onClick={logout} />
                    ) : (
                        <Button text='Buy Now' />
                    )
                }
                
            </div>
        </div>
    )
}