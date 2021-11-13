import './../assets/styles/home.scss'
import { ComponentTemplate } from '../components/componentTemplateCard'
import { pages } from './../utils'

export const Home = () => {
    return (
        <div className="home-main-div container">
            <div className="row">
                {
                    pages.map((item, index) => (
                        <div key={index} className="col-sm-4">
                            <ComponentTemplate itemkey={item?.key} heading={item?.heading} description={item?.description} imageValue={item?.imageName} />
                        </div>
                    ))
                }
            </div>
        </div>
    )
}