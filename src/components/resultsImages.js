import './../assets/styles/resultImages.scss'
import React from 'react'
import FaceImage from './faceImage'


export const ResultsImages = (props) => {
  return (
    <div className="images-placeholder-main-div">
        {
          props.images.map((item, index) => (
            <div key={index} className="images-placeholder-div" onClick={() => props.returnImage(index)}>
              <FaceImage image={item.image} boundingBox={item.boundingBox} />
            </div>
          ))
        }
    </div>
  )
}