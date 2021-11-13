import './../assets/styles/back.scss'
import arrowLeft from './../assets/images/arrowLeft.svg'
import { useHistory } from "react-router-dom";

export const Back = (props) => {
    const history = useHistory();

    const routeChange = () => {
        history.goBack();
    }

    return (
        <div className="left-arrow-div" onClick={routeChange}>
            <img src={arrowLeft} alt="arrow-left" />
            <p className="back-text">Back</p>
        </div>
    )
}