import "./../assets/styles/button.scss";
import { useHistory } from "react-router-dom";

export const Button = (props) => {
  const history = useHistory();

  const routeChange = () => {
    history.push(props.path);
  };

  const loginFunc = () => {
    props.callbackLoginFunc();
    routeChange();
  };

  return (
    <>
      {props.onClick && (
        <button
          type="button"
          className={`button ${props.className}`}
          onClick={props.onClick}
        >
          {props.text}
        </button>
      )}
      {props.callbackLoginFunc && (
        <button
          className={`button ${props.className}`}
          onClick={loginFunc}
        >
          {props.text}
        </button>
      )}
      {!props.onClick && !props.callbackLoginFunc && (
        <button
          className={`button ${props.className}`}
          onClick={routeChange}
        >
          {props.text}
        </button>
      )}
    </>
  );
};
