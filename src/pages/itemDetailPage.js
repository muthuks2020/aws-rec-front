import './../assets/styles/itemDetailPage.scss'

import { ItemDetailComponent } from './../components/itemDetailComponent'
import { Back } from './../components/back'

export const ItemDetailPage = (props) => {
    return (
        <div className="item-main-div">
            <Back />
            <ItemDetailComponent itemkey={props.match.params.itemkey} />
        </div>
    )
}