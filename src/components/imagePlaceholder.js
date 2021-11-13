import './../assets/styles/placeholder.scss'

export const ImagePlaceholder = (props) => {
    return (
        <>
            <div className="image-placeholder-container rounded">
                <img className="img-responsive fit-image rounded" src={require(`./../assets/images/features/${props.imageValue}`).default} alt="placeholder" />
            </div>
        </>
    )
}