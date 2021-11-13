import './../assets/styles/placeholder.scss'
import { useHistory } from "react-router-dom";
import { ImagePlaceholder } from './imagePlaceholder'

export const ComponentTemplate = (props) => {
    const history = useHistory();
    
    const routePage = () => {
        if (props.itemkey === 'faces-search-verification') {
            history.push(`/face-search-verification`);
        } else {
            history.push(`/${props.itemkey}`);
        }
    }

    return (
        <>
            <div className='action-link-all' onClick={routePage}>
                <ImagePlaceholder imageValue={props.imageValue}/>
                <h2 className="heading">{props.heading}</h2>
                <p className="description">{props.description}</p>
                <br/>
            </div>
        </>
    )
}