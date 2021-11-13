import { Form, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import "../assets/styles/table.scss";
import { TableDropdown } from "../components/tableDropdown";
import "../assets/styles/manageFaceCollection.scss";
import { Button } from "../components/button";
import { useHistory } from "react-router-dom";
import { Back } from "../components/back";
import AWS from 'aws-sdk'
import apiClient from "../api/apiClient";
import ScaleLoader from "react-spinners/ScaleLoader";
import { css } from "@emotion/react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logService from "../log/logService";
import { requestHeadersWithJWT } from "../api/apisupport";
import { primaryColor } from "../assets/colors";

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const intitialState = {
  name: "",
  id: "",
  _id: "",
};

export const ManageFaceCollection = () => {
  const [showModal, setShowModal] = useState(false);
  const [formVal, setFormVal] = useState(intitialState);
  const [action, setAction] = useState('')
  const history = useHistory()
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

   //AWS config update
   AWS.config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_SECRET_KEY,
    region: process.env.REACT_APP_REGION,
  });

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

  //Handle action click
  const handleClick = async (action, data) => {
    //Clear on click
    setFormVal({
      name: "",
      id: "",
      _id: "",
    });

    //On Click action or view 
    if (action === 'edit') {
      setAction(action)
      setShowModal(true);
      setFormVal({
        name: data.collectionName,
        id: data.collectionId,
        _id: data._id,
      });
    }

    //On click create
    if (action === 'create') {
      setAction(action)
      setShowModal(true);
    }

    //On click delete
    if (action === 'delete') {
      setAction(action)
      const deleteAction = await deleteCollection(data._id,data.collectionId);
      if (deleteAction){
        //Update list after delete
        const allcollection = await retrieveCollection()
        if (allcollection){
          setCollections(allcollection);
        }else{
          notifyError("Error in retrieve collection from DB")
          //Error in retrive from DB
        }
      }
    }

    //On click view face
    if (action === 'view') {
      history.push({pathname:'/face-search-verification/add-remove-face-in-collection',state: data})
    }
  };

  //Model action for create and update
  const handleClickCreateUpdateButton = async (event) => {
    if (formVal.name === ''){
      notifyError(`Collection name can't be empty`)
      return
    }else if (formVal.id === ''){
      notifyError(`Collection id can't be empty`)
      return
    }

    //Event fall create
    setShowModal(false);
    if (event === 'create'){
      const addedCollection = await addCollection(formVal.name,formVal.id)
      if (addedCollection){
        //Update list after create
        const allcollection = await retrieveCollection()
        if (allcollection){
          setCollections(allcollection);
        }else{
          //Error in retrive from DB
          notifyError("Error in retrieve collection from DB")
        }
      }
    }
    //Event fall update
    if (event === 'update'){
      const addedCollection = await updateCollection(formVal.name,formVal.id,formVal._id)
      if (addedCollection){
        //Update list after update
        const allcollection = await retrieveCollection()
        if (allcollection){
          setCollections(allcollection);
        }else{
           //Error in retrive from DB
          notifyError("Error in retrieve collection from DB")
        }
      }
    }
    
    setFormVal({
      name: "",
      id: "",
      _id: "",
    });
  }

  //AWS Create new collection
  const awsCreateNewCollection = async (collectionId) => {
    setLoading(true)
    const rekognition = new AWS.Rekognition();
    const params = {
      CollectionId : collectionId
    };
    try{
      rekognition.createCollection(params, function(err, response) {
        setLoading(false)
        if (err) {
          logService.log(err)
          // console.log(err, err.stack); // an error occurred
          notifyError(`Error! Faild to create collection in AWS`)
        } else {
          // console.log(response)
          notifySuccess(`Collection has been added successfully.`)
        } // if
      });
    }catch(error) {
      setLoading(false)
      logService.log(error)
      notifyError(`${error.message}`)
      // console.log('Error', error.message);
      return error.response
    }
  }

  //AWS Delete a collection
  const awsDeleteCollection = async (collectionId) => {
    setLoading(true)
    const rekognition = new AWS.Rekognition();
    const params = {
      CollectionId : collectionId
    };
    try{
      rekognition.deleteCollection(params, function(err, response) {
        setLoading(false)
        if (err) {
          logService.log(err)
          notifyError(`Error ${err}`)
          // console.log(err, err.stack); // an error occurred
        } else {
          // console.log(response)
          notifySuccess(`Collection has been deleted.`)
        } // if
      });
    }catch(error) {
      setLoading(false)
      logService.log(error)
      notifyError(`${error.message}`)
      return error.response
    }
  }

  //AWS List all collection
  // const awsFetchAllCollections = async () => {
  //   setLoading(true)
  //   const rekognition = new AWS.Rekognition();
  //   const params = {
  //     MaxResults : 10
  //   };

  //   rekognition.listCollections(params, function(err, response) {
  //       setLoading(false)
  //       if (err) {
  //         logService.log(err)
  //         // console.log(err, err.stack); // an error occurred
  //       } else {
  //         // console.log(response)
  //       } // if
  //   });
  // }

  //DB Retrieve Collection
  const retrieveCollection = async () =>{
    setLoading(true)
    try{
      const response = await apiClient.get("/collections",{
        headers: requestHeadersWithJWT
      })
      setLoading(false)
      console.log(response)
      if (response.status === 200){
        return response.data.collections
      }else{
        return []
      }
    }catch(error) {
      setLoading(false)
      logService.log(error)
      notifyError(`${error}`)
      return []
    }
  };

  //DB Add Collection
  const addCollection = async (collectionName,collectionId) =>{
    setLoading(true)
    let rawData = {
      "collectionName":collectionName,
      "collectionId":collectionId
    }
    try{
      const response = await apiClient.post("/collections",rawData,{
        headers: requestHeadersWithJWT
      })
      setLoading(false)
      if (response.status === 201){
        /* eslint-disable no-unused-vars */
        const awsResponse = await awsCreateNewCollection(collectionId)
        /* eslint-enable no-unused-vars */
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
  const updateCollection = async (collectionName,collectionId,_id) =>{
    setLoading(true)
    let rawData = {
      "collectionName":collectionName,
      "collectionId":collectionId
    }
    try{
      const response = await apiClient.patch(`/collections/${_id}`,rawData,{
        headers: requestHeadersWithJWT
      })
      setLoading(false)
      if (response.status === 201){
        notifySuccess(`Collection has been updated.`)
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

  //DB Delete Collection
  const deleteCollection = async (id,collectionId) =>{
    setLoading(true)
    try{
      const response = await apiClient.delete(`/collections/${id}`,{
        headers: requestHeadersWithJWT
      })
      // console.log(response);
      setLoading(false)
      if (response.status === 200){
        // console.log("200 status : deleteCollection")
        //Start delete from AWS
        /* eslint-disable no-unused-vars */
        const deleteCollectionRes = await awsDeleteCollection(collectionId)
        /* eslint-enable no-unused-vars */
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
    const getAllCollection = async () => {
      const allcollection = await retrieveCollection()
      if (allcollection){
        setCollections(allcollection);
      }else{
        setCollections([]);
      }
    }
    getAllCollection();
  }, [])

  const handleChangeName = (e) => {
    setFormVal({
      name: e.target.value,
      id: formVal.id,
      _id: formVal._id
    }); 
  }

  const handleChangeId = (e) => {
    setFormVal({
      name: formVal.name,
      id: e.target.value,
      _id: formVal._id
    }); 
  }

  return (
    <>
    <Back/>
    <ToastContainer />
    <div className="container main-div-MFC">
      <div className="row d-flex justify-content-center align-items-center flex-wrap p-4">
        <h2 className="heading_bold col-md-10 col-sm-12 text-center">Face Collections</h2>
        <Button className="col-md-2 col-sm-12" text='+ Add New' onClick={() => handleClick('create')} />
      </div>

      <div className="d-flex">
        <table className="table table-borderless table-responsive-sm">
          <thead>
            <tr>
              <th scope="col">Collection Name</th>
              <th scope="col">Collection Id</th>
              <th scope="col" style={{ width: 200 }}>
                Created
              </th>
              <th scope="col">View Faces</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((data) => (
              <tr key={data._id + data.collectionName}>
                <th>{data.collectionName}</th>
                <td>{data.collectionId}</td>
                <td>{(new Date(data.createdAt)).toString()}</td>
                <td>
                  <Button onClick={()=>handleClick('view', data)} text="View"/>
                </td>
                <td>
                  <TableDropdown
                    onClick={(action) => handleClick(action, data)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Title id="contained-modal-title-vcenter">
          <h2 className="heading_bold text-center">{action !== 'edit' ? 'Create Collection' : 'Edit Collection'}</h2>
        </Modal.Title>
        <Modal.Body>
          <Form className="d-flex flex-column align-items-center">
            <Form.Group controlId="collection">
              <Form.Control
                className="input-field"
                type="text"
                defaultValue = ""
                onChange = { handleChangeName.bind(this) }
                placeholder="Collection Name"
                disabled={action === 'view'}
                value={formVal.name}
              />
              <Form.Control
                className="input-field"
                type="text"
                defaultValue = ""
                onChange = { handleChangeId.bind(this) }
                disabled={action === 'view' || action === 'edit'}
                placeholder="Collection ID"
                value={formVal.id}
              />
            </Form.Group>
            {action === 'edit' && <Button text='Update' onClick={() => handleClickCreateUpdateButton('update')} />}
            {action === 'create' && <Button text='Create' onClick={() => handleClickCreateUpdateButton('create')} />}
          </Form>
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

    </div>
    </>
  );
};
