import { Button } from "../components/button";
import { TableDropdown } from "../components/tableDropdown";
//import { faceCollectionIDData } from "../utils";
import "../assets/styles/addRemoveFaceCollection.scss";
import "./../assets/styles/placeholder.scss";
import "./../assets/styles/itemDetailComponent.scss";
import { Back } from "../components/back";
import { useState, useEffect } from "react";
import { Form, Modal } from "react-bootstrap";
import imagePlaceholder from "./../assets/images/imagePlaceholder.svg";
import apiClient from "../api/apiClient";
import { requestHeadersWithJWT } from "../api/apisupport";
import ScaleLoader from "react-spinners/ScaleLoader";
import { css } from "@emotion/react";
import { primaryColor } from "../assets/colors";
import { ToastContainer, toast } from 'react-toastify';
import logService from "../log/logService";
import AWS from 'aws-sdk'

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const intitialFaceState = {
  fullName: "",
  emailAddress:"",
  photoUrl: "",
  faceId: "",
  externalId: "",
  collectionId: "",
  _id: "",
};

export const AddRemoveFaceInCollection = props => {
  const { state } = props.location
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedTypeFile, setSelectedTypeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [faces, setFaces] = useState([]);
  const [selectedFace,setSelectedFace] = useState(intitialFaceState);

  //Success Notification
  const notifySuccess = (message) => toast.success(`${message}`, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  //Error Notification
  const notifyError = (message) => toast.error(`${message}`, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  //Action on click data edit / view
  const handleClick = (action,data) => {
    setSelectedFace(intitialFaceState)
    setSelectedFace({
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      photoUrl: data.photoUrl,
      faceId: data.faceId,
      externalId: data.externalId,
      collectionId: data.collectionId,
      _id : data._id
    })

    if (action === 'edit') {
      setShowEditModal(true)
    }

    if ( action === 'view'){
      setShowEditModal(true)
    }

    if ( action === 'delete'){
      deleteFaceFromCollectionAWS(data.collectionId,data.faceId,data._id)
    }
  }

  //Action on create new button
  const handleClickCreateNew = () => {
    setShowAddModal(true)
    setSelectedFace(intitialFaceState)
    setSelectedTypeFile(null)
    setSelectedPhoto(null)
  }

  //Action on photo upload
  const changeHandler = (event) => {
    if (event.target.files[0]) {
      setSelectedPhoto(URL.createObjectURL(event.target.files[0]));
      setSelectedTypeFile(event.target.files[0])
    }
  }

  //AWS config update
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_SECRET_KEY,
    region: process.env.REACT_APP_REGION,
  });

  const s3ObjectImage = (url) =>{
    var s3 = new AWS.S3({apiVersion: process.env.REACT_APP_S3_API_VERSION});
    var getParams = {
      Bucket: process.env.REACT_APP_BUCKET_NAME, // your bucket name,
      Key: url // path to the object you're looking for
    }
    return s3.getSignedUrl('getObject', getParams)    
  }

  //On Click action on creating new face
  const onClickHandlerCreating = async () => {
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    if (selectedFace.fullName === ''){
      notifyError(`Full name can't be empty`)
      return
    }else if (selectedFace.emailAddress === ''){
      notifyError(`Email address can't be empty`)
      return
    }else if (!pattern.test(selectedFace.emailAddress)){
      notifyError(`Invalid email address`)
      return
    }else if (selectedTypeFile === null || selectedPhoto === null  ){
      notifyError(`Please upload a photo`)
      return
    }

    try{
      setLoading(true)
      //MARK:- S3 Upload
      var s3 = new AWS.S3({apiVersion: process.env.REACT_APP_S3_API_VERSION});
      let timeStampCreated = Math.floor(Date.now() / 1000)
      let filNameOnlyWithExt = timeStampCreated + process.env.REACT_APP_S3_PHOTO_SEPARATOR + selectedTypeFile.name
      let extranlIdGen = process.env.REACT_APP_FACE_START_WITH + timeStampCreated
      let fileNameGen = process.env.REACT_APP_DIR_NAME + filNameOnlyWithExt
      var paramsS3 = {
        Key: fileNameGen,
        Body: selectedTypeFile,
        Bucket: process.env.REACT_APP_BUCKET_NAME
      };
      s3.upload(paramsS3, function (err, data) {
        setLoading(false)
        if (err) {
          notifyError(`Upload image faild : ${err}`)
          logService.log(err)
        } else {
          //Successfully uploaded image
          //Start AWS Add Face
          startAddingAWS(data,extranlIdGen);
        }
      });
    }catch(error) {
      setLoading(false)
      logService.log(error)
      notifyError(`${error.message}`)
      return error.response
    }
  }

  //MARK:- AWS insert face into collection
  const startAddingAWS = async (s3SuccessResponse,exExternalId) => {
    try{
      setLoading(true)
      //AWS insert face into collection
      const rekognition = new AWS.Rekognition();
      const params = {
        CollectionId: state.collectionId,
        Image: {
            S3Object: {
                Bucket: process.env.REACT_APP_BUCKET_NAME,
                Name: s3SuccessResponse.key
            }
        },
        ExternalImageId: exExternalId,
        DetectionAttributes: [
            "DEFAULT"
        ],
        MaxFaces: 1,
        QualityFilter: "AUTO"
      };

      rekognition.indexFaces(params, function(err, response) {
        setLoading(false)
        if (err) {
          logService.log(err) // an error occurred
          notifyError(`Error! Faild to add into collection`)
        } else {
          setShowAddModal(false)
          if (response.FaceRecords.length > 0){
            notifySuccess(`Face has been successfully added into AWS collection.`)
            let faceFoundOne = response.FaceRecords[0]
            let faceObject = faceFoundOne.Face
            let apiRawData = {
              fullName: selectedFace.fullName,
              emailAddress: selectedFace.emailAddress,
              photoUrl: s3SuccessResponse.Key,
              faceId: faceObject.FaceId,
              externalId: faceObject.ExternalImageId,
              collectionId: state.collectionId
            }
            addFaceInCollection(apiRawData)
          }else{
            notifyError(`Error! No face found.`)
          }
        } // if
      });
    }catch(error) {
      setLoading(false)
      logService.log(error)
      notifyError(`${error.message}`)
      //console.log('Error', error.message);
      return error.response
    }
  }

  //MARK:- AWS delete face from collection
  const deleteFaceFromCollectionAWS = async (collection_id,face_id,person_id) => {
    try{
      setLoading(true)
      //AWS delete face from collection
      const rekognition = new AWS.Rekognition();
      const params = {
        CollectionId: collection_id,
          FaceIds: [
            face_id
          ]
      };

      rekognition.deleteFaces(params, function(err, response) {
        setLoading(false)
        if (err) {
          logService.log(err)
          //console.log(err, err.stack); // an error occurred
          notifyError(`AWS Error! Faild to delete face from collection`)
        } else {
          if (response.DeletedFaces.length > 0){
            //console.log(response)
            notifySuccess(`Face has been deleted from AWS collection.`)
            deleteFaceInDB(person_id)
          }else{
            notifyError(`AWS Error! Faild to delete face from collection`)
          }
        } // if
      });
    }catch(error) {
      setLoading(false)
      logService.log(error)
      notifyError(`${error.message}`)
      //console.log('Error', error.message);
      return error.response
    }
  }

  //Action on change full name text field
  const handleChangeFullName = (e) => {
    setSelectedFace({
        fullName: e.target.value,
        emailAddress: selectedFace.emailAddress,
        photoUrl: selectedFace.photoUrl,
        faceId: selectedFace.faceId,
        externalId: selectedFace.externalId,
        collectionId: selectedFace.collectionId,
        _id: selectedFace._id
    });
  }

  //Action on change email text field
  const handleChangeEmail = (e) => {
    setSelectedFace({
      fullName: selectedFace.fullName,
      emailAddress: e.target.value,
      photoUrl: selectedFace.photoUrl,
      faceId: selectedFace.faceId,
      externalId: selectedFace.externalId,
      collectionId: selectedFace.collectionId,
      _id: selectedFace._id
    });
  }

  //DB Retrieve Faces
  const retrieveAllFacesById = async () =>{
    try{
      setLoading(true)
      const response = await apiClient.get(`/collections/${state.collectionId}`,{
        headers: requestHeadersWithJWT
      })
      setLoading(false)
      if (response.data.length > 0){
        if (response.data[0].persons.length > 0){
          return response.data[0].persons
        }else{
          return []
        }
      }else{
        return []
      }
    }catch(error) {
        setLoading(false)
        logService.log(error)
        notifyError(`${error}`)
        if (error.response) {
            // Request made and server responded
            //console.log(error.response.data);
            // console.log(error.response.status);
            // console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            //console.log(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            //console.log('Error', error.message);
        }
        return error.response
    }
  };

  //DB Add Collection
  const addFaceInCollection = async (requestRawData) =>{
    try{
      setLoading(true)
      const response = await apiClient.post("/persons",requestRawData,{
        headers: requestHeadersWithJWT
      })
      setLoading(false)
      if (response.status === 201){
        //console.log("201 status")
        notifySuccess(`Added face details successfully saved.`)
        //Update list after add
        const allFaces = await retrieveAllFacesById()
        if (allFaces){
          setFaces(allFaces)
        }else{
          //Error in retrive from DB
          notifyError("Error in retrieve faces from DB")
        }
      }else{
        notifyError(`response.status ${response.status} Error add collection in local database`)
      }
      return response.data
    }catch(error) {
      setLoading(false)
      logService.log(error)
      notifyError(`${error}`)
      if (error.response) {
          // Request made and server responded
          // console.log(error.response.data);
          // console.log(error.response.status);
          // console.log(error.response.headers);
      } else if (error.request) {
          // The request was made but no response was received
          // console.log(error.request);
      } else {
          // Something happened in setting up the request that triggered an Error
          // console.log('Error', error.message);
      }
      return error.response
    }
  };

  //DB Update Collection
  const updateFaceInDB = async () =>{
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    if (selectedFace.fullName === ''){
      notifyError(`Full name can't be empty`)
      return
    }else if (selectedFace.emailAddress === ''){
      notifyError(`Email address can't be empty`)
      return
    }else if (!pattern.test(selectedFace.emailAddress)){
      notifyError(`Invalid email address`)
      return
    }

    try{
      setLoading(true)
      let apiRawData = {
        fullName: selectedFace.fullName,
        emailAddress: selectedFace.emailAddress,
        photoUrl: selectedFace.photoUrl,
        faceId: selectedFace.faceId,
        externalId: selectedFace.externalId,
        collectionId: selectedFace.collectionId
      }
      const response = await apiClient.patch(`/persons/${selectedFace._id}`,apiRawData,{
        headers: requestHeadersWithJWT
      })
      setLoading(false)
      if (response.status === 201){
        //console.log("201 status")
        notifySuccess(`Face details has been updated successfully.`)
        setShowEditModal(false)
        //Update list after add
        const allFaces = await retrieveAllFacesById()
        if (allFaces){
          setFaces(allFaces)
        }else{
          //Error in retrive from DB
          notifyError("Error in retrieve faces from local storage")
        }
      }else{
        notifyError(`response.status ${response.status} update collection in local database`)
      }
      return response.data
    }catch(error) {
      setLoading(false)
      logService.log(error)
      notifyError(`${error}`)
      if (error.response) {
          // Request made and server responded
          // console.log(error.response.data);
          // console.log(error.response.status);
          // console.log(error.response.headers);
      } else if (error.request) {
          // The request was made but no response was received
          //console.log(error.request);
      } else {
          // Something happened in setting up the request that triggered an Error
          //console.log('Error', error.message);
      }
      return error.response
    }
  };

  //DB delete collection
  const deleteFaceInDB = async (person_id) =>{
    try{
      setLoading(true)
      const response = await apiClient.delete(`/persons/${person_id}`,{
        headers: requestHeadersWithJWT
      })
      setLoading(false)
      if (response.status === 200){
        notifySuccess(`Face has been deleted from collection.`)
        //Update list after add
        const allFaces = await retrieveAllFacesById()
        if (allFaces){
          setFaces(allFaces)
        }else{
          //Error in retrive from DB
          notifyError("Error in retrieve faces from local storage")
        }
      }else{
        notifyError(`response.status ${response.status} Error delete collection in local database`)
      }
      return response.data
    }catch(error) {
      setLoading(false)
      logService.log(error)
      notifyError(`${error}`)
      if (error.response) {
          // Request made and server responded
          // console.log(error.response.data);
          // console.log(error.response.status);
          // console.log(error.response.headers);
      } else if (error.request) {
          // The request was made but no response was received
          // console.log(error.request);
      } else {
          // Something happened in setting up the request that triggered an Error
          // console.log('Error', error.message);
      }
      return error.response
    }
  };

  useEffect(() => {
    const getAllFace = async () => {
      const allFacesFromDB = await retrieveAllFacesById()
      if (allFacesFromDB){
        setFaces(allFacesFromDB);
      }
    }
    
    getAllFace();
  }, [])

  return (
    <>
      <Back />
      <ToastContainer />
      <div className="container main-div-ARF">
        <div className="row d-flex justify-content-center align-items-center p-4">
          <h2 className="heading_bold col-md-10 col-sm-12 text-center">
            Faces in collection { state.collectionName }
          </h2>
          <Button
            className="col-md-2 col-sm-12"
            text="+ Add New"
            onClick={() => handleClickCreateNew()}
          />
        </div>

        <div className="d-flex">
          <table className="table table-borderless table-responsive-sm">
            <thead>
              <tr>
                <th scope="col">Full Name</th>
                <th scope="col">Email</th>
                <th scope="col">Face ID</th>
                <th scope="col">External ID</th>
                <th scope="col" style={{ width: 200 }}>
                  Created
                </th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {faces.map((data) => (
                <tr key={data._id}>
                  <td>{data.fullName}</td>
                  <td>{data.emailAddress}</td>
                  <td>{data.faceId}</td>
                  <td>{data.externalId}</td>
                  <td>{data.createdAt}</td>
                  <td>
                    <TableDropdown onClick={(action) => handleClick(action,data)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
        size="lg"
        className="p-4"
      >
        <Modal.Title id="contained-modal-title-vcenter">
          <h2 className="heading_bold text-center">
            Add new face into collection
          </h2>
        </Modal.Title>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6 col-sm-12">
              <div className="detail-image-placeholder-container-face">
                {
                  (selectedPhoto) ? (
                    <div width='210' height='230'>
                          <img src={selectedPhoto} alt="placeholder" width='100%'/>
                    </div>
                  ) : (
                    <img src={imagePlaceholder} alt="placeholder" />
                  ) 
                }
              </div>
              <label className="custom-file-upload-face">
                <input accept="image/png, image/jpeg" type="file" onChange={changeHandler} />
                Upload File
              </label>
            </div>
            <div className="col-md-6 col-sm-12">
              <Form className="d-flex flex-column align-items-center">
                <Form.Group controlId="collection">
                  <Form.Control
                    className="input-field"
                    type="text"
                    defaultValue = "" 
                    onChange = { handleChangeFullName.bind(this) }
                    placeholder="Full Name"
                    value={selectedFace.fullName }
                  />
                  <Form.Control
                    className="input-field"
                    type="text"
                    defaultValue = "" 
                    onChange = { handleChangeEmail.bind(this) }
                    placeholder="Email Address"
                    value={selectedFace.emailAddress}
                  />
                </Form.Group>
                <Button text="Create" onClick={() => onClickHandlerCreating()} />
              </Form>
            </div>
          </div>
        </Modal.Body>
      </Modal>


      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        size="lg"
        className="p-4"
      >
        <Modal.Title id="contained-modal-title-vcenter">
          <h2 className="heading_bold text-center">
          Update face into collection
          </h2>
        </Modal.Title>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6 col-sm-12">
              <div className="detail-image-placeholder-container-face">
                {
                  (selectedFace.photoUrl && showEditModal) ? (
                    <img src={s3ObjectImage(selectedFace.photoUrl)} alt="face" width='100%' />
                  ) : (
                    <img src={imagePlaceholder} alt="placeholder" />
                  ) 
                }
              </div>
            </div>
            <div className="col-md-6 col-sm-12">
              <Form className="d-flex flex-column align-items-center">
                <Form.Group controlId="collection">
                  <Form.Control
                    className="input-field"
                    type="text"
                    defaultValue = "" 
                    onChange = { handleChangeFullName.bind(this) }
                    placeholder="Full Name"
                    value={selectedFace.fullName}
                  />
                  <Form.Control
                    className="input-field"
                    type="text"
                    defaultValue = "" 
                    onChange = { handleChangeEmail.bind(this) }
                    placeholder="Email Address"
                    value={selectedFace.emailAddress}
                  />
                </Form.Group>
              </Form>
            </div>

            <div className="d-flex align-items-center w-100 flex-column mt-4 mb-4 flex-wrap p-4" style={{gap: 10}}>
              <p className="description">Face ID : {selectedFace.faceId}</p>
              <p className="description">External ID : {selectedFace.externalId}</p>
              <Button text="Update" onClick={() => updateFaceInDB()} />
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={loading} centered>
        <div className="d-flex flex-column align-items-center">
          <ScaleLoader color={primaryColor} loading={loading} css={override} size={150} />
          <div>
          <p>Loading...</p>
          </div>
        </div>
      </Modal>
    </>
  );
};
