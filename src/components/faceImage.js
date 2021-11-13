import React from 'react'
import getCroppedImg from './cropImage'
import reactImageSize from 'react-image-size';

class FaceImage extends React.Component {

    constructor(props){
        super(props);
        this.state = { img: null }
    }

    async getCroppedImage(image,boundingBox){
        try {
            const { width, height } = await reactImageSize(image);
            const croppedImage = await getCroppedImg(image,{ width: (boundingBox.Width * width), height: (boundingBox.Height * height), x: (boundingBox.Left * width), y: (boundingBox.Top * height)})
            this.setState({
                img: croppedImage
            });
        } catch(e) {
            console.log(e);
        }
    }

    componentDidMount() {
        this.getCroppedImage(this.props.image,this.props.boundingBox)
    }

    render() {
        return ( <img src={this.state.img} style={{width: '100px',height: '100px'}} alt="face" />  );
    }
}

export default FaceImage;