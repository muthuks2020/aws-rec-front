import { useHistory } from "react-router-dom";
import "../assets/styles/faceSearchAndVerification.scss";
import { Back } from "../components/back";
import { ImagePlaceholder } from "../components/imagePlaceholder";
import { faceSearchItems } from "../utils";
import AWS from 'aws-sdk'

const SearchItem = ({ heading, onClick, image }) => {
  return (
    <div className="d-flex flex-column mx-4 item-div" onClick={onClick}>
      <ImagePlaceholder imageValue={image} />
      <h2 className="heading FS_ItemHeading">{heading}</h2>
    </div>
  );
};

export const FaceSearchAndVerification = () => {
  const history = useHistory();

  //AWS config update
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_SECRET_KEY,
    region: process.env.REACT_APP_REGION,
  });

  const handleClick = (key) => {
    history.push(`/face-search-verification/${key}`)
  }

  return (
    <div className="container-fluid main-div-FSV">
      <Back />
      <div className="d-flex flex-column mb-5">
        <h2 className="heading_bold">Face search and verification</h2>
        <p className="description">
        Face search verification provides fast and accurate face search, allowing you to<br/>
        identify a person in a photo using your private repository of face images.
        </p>
      </div>

      <div className="custom-div-css justify-content-between mx-auto flex-wrap">
        {faceSearchItems.map(item => <SearchItem key={item.key} heading={item.heading} image={item.image} onClick={() => handleClick(item.key)}/>)}
      </div>
    </div>
  );
};
