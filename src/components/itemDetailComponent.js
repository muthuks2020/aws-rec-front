import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import imagePlaceholder from './../assets/images/imagePlaceholder.svg'
import './../assets/styles/placeholder.scss'
import './../assets/styles/itemDetailComponent.scss'
import { Dropdown } from "react-bootstrap";
//import { resultsData } from './../utils'
//import { resultsImages } from './../utils'
import { resultsCheckboxes } from './../utils'
import { pages } from './../utils'
import { faceSearchItems } from './../utils'
//import { faceCollectionData } from './../utils'

import { Button } from './button'
import { ResultsData } from './resultsData'
import { ResultsImages } from './resultsImages'
import { ResultsCheckboxes } from './resultsCheckboxes'
import { loadingMessage,loadingMessageForFaceAnalysisOrPPE } from './../utils'
import AWS from 'aws-sdk'
import apiClient from "../api/apiClient";
import { requestHeadersWithJWT } from "../api/apisupport";
import { css } from "@emotion/react";
import { primaryColor } from "../assets/colors";
import { ToastContainer, toast } from 'react-toastify';
import logService from "../log/logService";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Modal } from "react-bootstrap";

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

export const ItemDetailComponent = (props) => {
    const [selectedMainPhoto, setSelectedMainPhoto] = useState(null);
    const [selectedFileTypeFile, setSelectedFileTypeFile] = useState(null);

    const [selectedPhotoOne, setSelectedPhotoOne] = useState(null);
    const [selectedFileTypeOneFile, setSelectedFileTypeOneFile] = useState(null);

    const [selectedPhotoTwo, setselectedPhotoTwo] = useState(null);
    const [selectedFileTypeTwoFile, setSelectedFileTypeTwoFile] = useState(null);

    const [heading, setHeading] = useState('');
    const [description, setDescription] = useState('');
    const [resultFlag, setResultFlag] = useState(false);
    const [faceFlag, setFaceFlag] = useState(false);
    
    //Label Detections
    const [labelDetecResult,setLabelDetecResult] = useState([loadingMessage]);

    //Face Analysis and PPE
    const [imageListOfResults, setImageListOfResults] = useState([]);
    const [selectedFaceResults,setSelectedFaceResults] = useState();
    const [selectedFace,setSelectedFace] = useState(loadingMessageForFaceAnalysisOrPPE);

    //Face Compare
    const [selectedSimilarity,setSelectedSimilarity] = useState([loadingMessage]);

    //Face Search
    const [allCollection,setAllCollection] = useState([])
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [faceMatchResult, setFaceMatchResult] = useState(null)
    const [faceMatchAPIResult, setFaceMatchAPIResult] = useState(null)

    //Text detection
    const [allDetectedText,setAllDetectedText] = useState({
        line : [], 
        word: []
    })

    const [loading, setLoading] = useState(false);

    const location = useLocation();

    //const result = resultsData.filter((item) => (item?.key === props.itemkey))

    ///AWS config update
    AWS.config.update({
        accessKeyId: process.env.REACT_APP_ACCESS_KEY,
        secretAccessKey: process.env.REACT_APP_SECRET_KEY,
        region: process.env.REACT_APP_REGION,
    });

    //Get s3 image in sync
    const s3ObjectImage = (url) =>{
        var s3 = new AWS.S3({apiVersion: process.env.REACT_APP_S3_API_VERSION});
        var getParams = {
          Bucket: process.env.REACT_APP_BUCKET_NAME, // your bucket name,
          Key: url // path to the object you're looking for
        }
        return s3.getSignedUrl('getObject', getParams)    
    }

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

    useEffect(() => {
        if (location.pathname === '/face-search-verification/search-face-by-image') {
            setFaceFlag(true)
            let item = faceSearchItems.filter((item) => (item.key === 'search-face-by-image'))
            setHeading(item[0].heading)
            const getAllCollection = async () => {
                const allCollection = await retrieveAllCollection()
                //console.log(allCollection)
                if (allCollection){
                    setAllCollection(allCollection.collections)
                }else{
                    setAllCollection([])
                }
            }
            getAllCollection();
        } else {
            setFaceFlag(false)
            let item = pages.filter((item) => (item.key === props.itemkey))
            setHeading(item[0].heading)
            setDescription(item[0].description)
        }
    }, [])

    //GO button actions
    const buttonClick = () => {
        if (location.pathname === '/facial-analysis'){
            setImageListOfResults([])
            setSelectedFaceResults()
            fetchFaceAnalysisFromAWS(selectedFileTypeFile)
        }else if (location.pathname === '/label_detect'){
            fetchLabelFromAWS(selectedFileTypeFile)
        }else if (location.pathname === '/face-search-verification/search-face-by-image'){
            setFaceMatchResult(null)
            setFaceMatchAPIResult(null)
            startSearchInCollection(selectedFileTypeFile)
        }else if (location.pathname === '/ppe-detection'){
            startPPEDetection(selectedFileTypeFile)
        }else if (location.pathname === '/faces-comparison'){
            fetchCompareFaceFromAWS(selectedFileTypeOneFile,selectedFileTypeTwoFile)
        }else if (location.pathname === '/text-detection'){
            startAWSTextDetection(selectedFileTypeFile)
        }
    }

    const changeHandler = async (event) => {
        if (event.target.files[0]) {
            setSelectedFileTypeFile(event.target.files[0])
            setSelectedMainPhoto(URL.createObjectURL(event.target.files[0]))
        }
    }

    const toBase64 = async (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
    
    const changeHandlerFaceOne = (event) => {
        if (event.target.files[0]) {
            setSelectedPhotoOne(URL.createObjectURL(event.target.files[0]));
            setSelectedFileTypeOneFile(event.target.files[0]);
        }
    }

    const changeHandlerFaceTwo = (event) => {
        if (event.target.files[0]) {
            setselectedPhotoTwo(URL.createObjectURL(event.target.files[0]));
            setSelectedFileTypeTwoFile(event.target.files[0]);
        }
    }

    //Set Selected Face Results on select for Face Analysis
    const getSelectedFaceForFaceAnalysis = (index) => {
        setSelectedFace(selectedFaceResults[index])
    }

    //Set Selected Face Results on select for Face Compare
    const getSelectedFaceForFaceCompare = (index) => {
        setSelectedSimilarity(selectedFaceResults[index])
    }

    const getConfidenceWithMark = (confidence) => {
        return `${confidence.toFixed(2)}%`
    }

    //AWS Label Detection
    const fetchLabelFromAWS = async (file) => {
        //console.log("Start AWS Label Detection")
        if (file === null || file === undefined){
            notifyError(`Upload a photo to continue`)
            return
        }
        try{
            setLoading(true)
            const imageBytes = await toBase64(file)
            const rekognition = new AWS.Rekognition();
            const params = {
                Image: {
                    Bytes: imageBytes,
                },
                MaxLabels: process.env.REACT_APP_MAX_LABEL_DETECT,
                MinConfidence: process.env.REACT_APP_MIN_CONFIDENCE 
            };
            rekognition.detectLabels(params, function(err, response) {
                setLoading(false)
                if (err) {
                    //console.log(err, err.stack); // an error occurred
                    logService.log(err)
                    notifyError(err.message)
                } else {
                    var allLabelDetecResult = [];
                    response.Labels.forEach(label => {
                        const labelName = label.Name
                        const confidence = label.Confidence
                        allLabelDetecResult.push({
                            name : labelName, value: getConfidenceWithMark(confidence)
                        });
                    }) // for response.labels
                    setLabelDetecResult(allLabelDetecResult);
                    setResultFlag(true)
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

    //AWS Face Analysis
    const fetchFaceAnalysisFromAWS = async (file) => {
        //console.log("Start AWS Face Analysis")
        if (file === null || file === undefined){
            notifyError(`Upload a photo to continue`)
            return
        }
        try{
            setLoading(true)
            const imageBytes = await toBase64(file)
            const rekognition = new AWS.Rekognition();
            const params = {
                Image: {
                    Bytes: imageBytes,
                },
                Attributes: [
                    "ALL"
                ]
            };
            rekognition.detectFaces(params, function(err, response) {
                setLoading(false)
                if (err) {
                    logService.log(err)
                    notifyError(err.message)
                    //console.log(err, err.stack); // an error occurred
                } else {
                    //console.log(`Face Analysis`)
                    var allDetectedFaceResult = [];
                    var resultValueForAllFaces = [];
                    response.FaceDetails.forEach(data => {
                        var allDetectedFaceGeneralList = [];
                        var allDetectedFaceFeatureList = [];
                        var allDetectedFaceEmotionList = [];
                        //Face Image
                        const boundingBox = data.BoundingBox
                        const imageURL = selectedMainPhoto
                        allDetectedFaceResult.push({
                            image : imageURL, boundingBox: boundingBox
                        });
                        //General
                            //Face confidence
                        allDetectedFaceGeneralList.push({
                            name : "looks like a face", value: getConfidenceWithMark(data.Confidence)
                        });
                            //Gender
                        allDetectedFaceGeneralList.push({
                            name : `appears to be ${data.Gender.Value}`, value: getConfidenceWithMark(data.Gender.Confidence)
                        });
                            //Get Age
                        let low  = data.AgeRange.Low
                        let high = data.AgeRange.High
                        //console.log(`The detected face is between: ${low} and ${high} years old`)
                        allDetectedFaceGeneralList.push({
                            name : `age range`, value: `${low} - ${high} years old`
                        });
                            //Smile
                        allDetectedFaceGeneralList.push({
                            name : `smiling ${data.Smile.Value}`, value: getConfidenceWithMark(data.Smile.Confidence)
                        });

                        //Feature
                            //mouth is open
                        allDetectedFaceFeatureList.push({
                            name : `mouth is open ${data.MouthOpen.Value}`, value: getConfidenceWithMark(data.MouthOpen.Confidence)
                        });
                            //does not have a mustache
                        allDetectedFaceFeatureList.push({
                            name : `does not have a mustache ${data.Mustache.Value}`, value: getConfidenceWithMark(data.Mustache.Confidence)
                        });
                            //does not have a beard
                        allDetectedFaceFeatureList.push({
                            name : `does not have a beard ${data.Beard.Value}`, value: getConfidenceWithMark(data.Beard.Confidence)
                        });
                            //eyes are open
                        allDetectedFaceFeatureList.push({
                            name : `eyes are open ${data.EyesOpen.Value}`, value: getConfidenceWithMark(data.EyesOpen.Confidence)
                        });
                            //eyes are open
                        allDetectedFaceFeatureList.push({
                            name : `wearing glasses ${data.Eyeglasses.Value}`, value: getConfidenceWithMark(data.Eyeglasses.Confidence)
                        });
                            //wearing sunglasses
                        allDetectedFaceFeatureList.push({
                            name : `wearing sunglasses ${data.Sunglasses.Value}`, value: getConfidenceWithMark(data.Sunglasses.Confidence)
                        });

                        //Emotions
                        data.Emotions.forEach(Emotion => {
                            allDetectedFaceEmotionList.push({
                                name : `${Emotion.Type}`, value: getConfidenceWithMark(Emotion.Confidence)
                            });
                        })

                        resultValueForAllFaces.push({
                            first : allDetectedFaceGeneralList, 
                            second: allDetectedFaceFeatureList, 
                            third : allDetectedFaceEmotionList
                        });

                    }) // for response.faceDetails
                    //console.log(allDetectedFaceResult);
                    setImageListOfResults(allDetectedFaceResult);
                    setSelectedFaceResults(resultValueForAllFaces);
                    if (resultValueForAllFaces.length > 0){
                        setResultFlag(true)
                        setSelectedFace(resultValueForAllFaces[0]);
                    }else{
                        setResultFlag(false)
                        notifyError(`No face found`)
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

    //AWS Compare Face
    const fetchCompareFaceFromAWS = async (source,target) => {
        //console.log("Start AWS Face Compare")
        if (source === null || source === undefined){
            notifyError(`Upload a source photo to continue`)
            return
        }
        if (target === null || target === undefined){
            notifyError(`Upload a target photo to continue`)
            return
        }
        try{
            setLoading(true)
            const sourceImageBytes = await toBase64(source)
            const targetImageBytes = await toBase64(target)

            const rekognition = new AWS.Rekognition();
            const params = {
                SourceImage: {
                    Bytes: sourceImageBytes,
                },
                TargetImage: {
                    Bytes: targetImageBytes,
                },
                SimilarityThreshold: process.env.REACT_APP_FACE_COMPARE_SIMILARITY_THRESHOLD
            };

            rekognition.compareFaces(params, function(err, response) {
                setLoading(false)
                if (err) {
                    logService.log(err)
                    notifyError(err.message)
                    //console.log(err, err.stack); // an error occurred
                } else {
                    //console.log(response)
                    var allDetectedFaceResult = [];
                    var resultValueForAllFaces = [];

                    response.FaceMatches.forEach(data => {
                        let boundingBox = data.Face.BoundingBox
                        let imageURL = selectedPhotoTwo
                        allDetectedFaceResult.push({
                            image : imageURL, boundingBox: boundingBox
                        });
                        var resultValueForOneFace = [];
                        resultValueForOneFace.push({
                            name : "Similarity", value: getConfidenceWithMark(data.Similarity)
                        });
                        resultValueForOneFace.push({
                            name : "Confidence", value: getConfidenceWithMark(data.Face.Confidence)
                        });
                        resultValueForAllFaces.push(resultValueForOneFace);
                    }) // for response.FaceMatches
                    setImageListOfResults(allDetectedFaceResult);
                    setSelectedFaceResults(resultValueForAllFaces);
                    if (resultValueForAllFaces.length > 0){
                        setResultFlag(true)
                        setSelectedSimilarity(resultValueForAllFaces[0]);
                    }else{
                        setResultFlag(false)
                        notifyError(`No match face found`)
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

    //AWS search face in collection
    const startSearchInCollection = async (searchImage) => {
        //console.log("AWS search face in collection")
        if (selectedCollection === null){
            notifyError(`Select a collection to continue`)
            return
        }
        if (searchImage === null || searchImage === undefined){
            notifyError(`Upload a photo to continue`)
            return
        }
        const searchImageBytes = await toBase64(searchImage)
        try{
            setLoading(true)
            //AWS insert face into collection
            const rekognition = new AWS.Rekognition();
            const params = {
                CollectionId: selectedCollection.collectionId,
                Image: {
                    Bytes: searchImageBytes
                },
                MaxFaces: 1, //should be only one for save
                FaceMatchThreshold: process.env.REACT_APP_FACE_MATCH_THRESHOLD
            };

            rekognition.searchFacesByImage(params, function(err, response) {
                setLoading(false)
                if (err) {
                    logService.log(err)
                    //console.log(err, err.stack); // an error occurred
                    notifyError(`Error! Faild to search image in collection`)
                } else {
                    console.log(response)
                    if (response.FaceMatches.length > 0){
                        let faceId = response.FaceMatches[0].Face.FaceId
                        setFaceMatchResult(response.FaceMatches[0])
                        notifySuccess(`Face found in collection name ${selectedCollection.collectionName}`)
                        retrieveFacesById(faceId)
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

    //AWS PPE detection
    const startPPEDetection = async (imageFile) => {
        //console.log("AWS PPE detection")
        setResultFlag(true)
        if (imageFile === null || imageFile === undefined){
            notifyError(`Upload a photo to continue`)
            return
        }
        const imageBytes = await toBase64(imageFile)
        try{
            setLoading(true)
            const rekognition = new AWS.Rekognition();
            const params = {
                Image: {
                    Bytes: imageBytes
                },
                SummarizationAttributes : {
                    MinConfidence: process.env.REACT_APP_PPE_DETECT_MIN_CONFIDENCE,
                    RequiredEquipmentTypes: [
                        "FACE_COVER",
                        "HAND_COVER",
                        "HEAD_COVER"
                    ]
                }
            };

            rekognition.detectProtectiveEquipment(params, function(err, response) {
                setLoading(false)
                if (err) {
                    logService.log(err)
                    //console.log(err, err.stack); // an error occurred
                    notifyError(`Error! Faild to detect Protective Equipment.`)
                } else {
                    console.log(response)
                    //Clear all
                    setResultFlag(false)
                    setImageListOfResults([]);
                    setSelectedFaceResults();
                    setSelectedFace(loadingMessageForFaceAnalysisOrPPE);
                    //Process data
                    if (response.Persons.length > 0){
                        notifySuccess(`Successfully detected`)
                        var resultValueForAllPersons = [];
                        var allDetectedFaceResult = [];

                        response.Persons.forEach(person => {
                            let boundingBox = person.BoundingBox
                            let imageURL = selectedMainPhoto
                            allDetectedFaceResult.push({
                                image : imageURL, boundingBox: boundingBox
                            });
                            var allFirstResultSet = [];
                            var allSecondResultSet = [];
                            var allThirdResultSet = [];

                            //ProtectiveEquipmentBodyPart
                            if (person.BodyParts.length > 0){
                                //Person detect
                                allFirstResultSet.push({
                                    name : `Person detected`, value: getConfidenceWithMark(person.Confidence)
                                });
                                person.BodyParts.forEach(bodypart =>{
                                    //Face
                                    if (bodypart.Name === 'FACE'){
                                        allFirstResultSet.push({
                                            name : `Face detected`, value: getConfidenceWithMark(bodypart.Confidence)
                                        });
                                        bodypart.EquipmentDetections.forEach(equipment => {
                                            if (equipment.Type === "FACE_COVER"){
                                                allFirstResultSet.push({
                                                    name : `Face cover detected`, value: getConfidenceWithMark(equipment.Confidence)
                                                });
                                                allFirstResultSet.push({
                                                    name : `Face cover on nose : ${equipment.CoversBodyPart.Value}`, value: getConfidenceWithMark(equipment.CoversBodyPart.Confidence)
                                                });
                                            }
                                        });
                                    }
                                    //LEFT_HAND
                                    if (bodypart.Name === 'LEFT_HAND'){
                                        allSecondResultSet.push({
                                            name : `Left hand detected`, value: getConfidenceWithMark(bodypart.Confidence)
                                        });
                                        bodypart.EquipmentDetections.forEach(equipment => {
                                            if (equipment.Type === "HAND_COVER"){
                                                allSecondResultSet.push({
                                                    name : `Left hand cover detected`, value: getConfidenceWithMark(equipment.Confidence)
                                                });
                                                allSecondResultSet.push({
                                                    name : `Left hand cover on left hand :${equipment.CoversBodyPart.Value}`, value: getConfidenceWithMark(equipment.CoversBodyPart.Confidence)
                                                });
                                            }
                                        });
                                    }
                                    //LEFT_HAND
                                    if (bodypart.Name === 'RIGHT_HAND'){
                                        allSecondResultSet.push({
                                            name : `Right hand detected`, value: getConfidenceWithMark(bodypart.Confidence)
                                        });
                                        bodypart.EquipmentDetections.forEach(equipment => {
                                            if (equipment.Type === "HAND_COVER"){
                                                allSecondResultSet.push({
                                                    name : `Right hand cover detected`, value: getConfidenceWithMark(equipment.Confidence)
                                                });
                                                allSecondResultSet.push({
                                                    name : `Right hand cover on left hand :${equipment.CoversBodyPart.Value}`, value: getConfidenceWithMark(equipment.CoversBodyPart.Confidence)
                                                });
                                            }
                                        });
                                    }
                                    //HEAD
                                    if (bodypart.Name === 'HEAD'){
                                        allThirdResultSet.push({
                                            name : `Head detected`, value: getConfidenceWithMark(bodypart.Confidence)
                                        });
                                        bodypart.EquipmentDetections.forEach(equipment => {
                                            if (equipment.Type === "HEAD_COVER"){
                                                allThirdResultSet.push({
                                                    name : `Head cover detected`, value: getConfidenceWithMark(equipment.Confidence)
                                                });
                                                allThirdResultSet.push({
                                                    name : `Head cover on head :${equipment.CoversBodyPart.Value}`, value: getConfidenceWithMark(equipment.CoversBodyPart.Confidence)
                                                });
                                            }
                                        });
                                    }
                                });
                                resultValueForAllPersons.push({
                                    first : allFirstResultSet, 
                                    second: allSecondResultSet, 
                                    third : allThirdResultSet
                                });
                            }else{
                                resultValueForAllPersons.push({
                                    first : [], 
                                    second: [], 
                                    third : []
                                });
                            }
                        })
                        setImageListOfResults(allDetectedFaceResult);
                        setSelectedFaceResults(resultValueForAllPersons);
                        if (resultValueForAllPersons.length > 0){
                            setResultFlag(true)
                            setSelectedFace(resultValueForAllPersons[0]);
                        }else{
                            setResultFlag(false)
                            notifyError(`No person found`)
                        }
                    }else{
                        notifyError(`No person found.`)
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

    //AWS text detections
    const startAWSTextDetection = async (sourceImage) => {
        //console.log("start AWS text detections")
        if (sourceImage === null || sourceImage === undefined){
            notifyError(`Upload a image to continue`)
            return
        }
        const sourceImageBytes = await toBase64(sourceImage)
        try{
            setLoading(true)
            const rekognition = new AWS.Rekognition();
            const params = {
                Image: {
                    Bytes: sourceImageBytes
                }
            };
            rekognition.detectText(params, function(err, response) {
                setLoading(false)
                if (err) {
                    logService.log(err)
                    //console.log(err, err.stack);
                    notifyError(`Error! Faild to detect text in image.`)
                } else {
                    console.log(response)
                    const allLineText = []
                    const allWordText = []
                    allLineText.push({
                        name : `...LINE...`, value: ''
                    });
                    allWordText.push({
                        name : `...WORD...`, value: ''
                    });
                    if (response.TextDetections.length > 0){
                        response.TextDetections.forEach(textDetect =>{
                            if (textDetect.Type === "LINE"){
                                allLineText.push({
                                    name : textDetect.DetectedText, value: getConfidenceWithMark(textDetect.Confidence)
                                });
                            }
                            if (textDetect.Type === "WORD"){
                                allWordText.push({
                                    name : textDetect.DetectedText, value: getConfidenceWithMark(textDetect.Confidence)
                                });
                            }
                        })
                        const newAllDetectedText = {
                            line : allLineText, 
                            word: allWordText
                        };
                        setAllDetectedText(newAllDetectedText)
                        setResultFlag(true)
                        notifySuccess(`Text successfully detected in the image`)
                    }else{
                        notifyError(`Error! No text found.`)
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

    //DB retrieve faces by id
    const retrieveFacesById = async (facelId) =>{
        try{
            setLoading(true)
            const response = await apiClient.get(`/getbyfaceid/${facelId}`,{
                headers: requestHeadersWithJWT
            })
            setLoading(false)
            if (response.status === 200){
                if (response.data.length > 0){
                    setFaceMatchAPIResult(response.data[0])
                    setResultFlag(true)
                    notifySuccess(`Face found with below details.`)
                }else{
                    notifyError(`Error! No face found in local data`)
                }
            }else{
                notifyError(`Error! No face found in local data`)
            }
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

    //DB Retrieve Collections
    const retrieveAllCollection = async () =>{
        try{
            setLoading(true)
            const response = await apiClient.get(`/collections`,{
                headers: requestHeadersWithJWT
            })
            setLoading(false)
            if (response.status === 200){
                //Update list after add
                return response.data
            }else{
                notifyError(`Error ${response}`)
                return []
            } 
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
            return []
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="container">
                <div className="row">
                    <div className={(props.itemkey === 'faces-comparison') ? "col-sm-12 col-md-6 col-lg-6" : "col-sm-12 col-md-4 col-lg-4"}>
                        {
                            (props.itemkey === 'faces-comparison') && (
                                <div className="container">
                                    <div className="row">
                                        <div className="col-sm-12 col-md-6 col-lg-6">
                                            <div className="detail-image-placeholder-container-face">
                                            {
                                                (selectedPhotoOne) ? (
                                                    <div width='210' height='230'>
                                                        <img src={selectedPhotoOne} alt="placeholder face compare" width='100%'/>
                                                    </div>
                                                ) : (
                                                    <img src={imagePlaceholder} alt="placeholder"/>
                                                )
                                            }
                                            </div>
                                            <label className="custom-file-upload-face">
                                                <input accept="image/png, image/jpeg" type="file" onChange={changeHandlerFaceOne} />
                                                Upload File
                                            </label>
                                        </div>
                                        <div className="col-sm-12 col-md-6 col-lg-6">
                                            <div className="detail-image-placeholder-container-face">
                                            {
                                                (selectedPhotoTwo) ? (
                                                    <div width='210' height='230'>
                                                        <img src={selectedPhotoTwo} alt="placeholder" width='100%'/>
                                                    </div>
                                                ) : (
                                                    <img src={imagePlaceholder} alt="placeholder"/>
                                                )
                                            }
                                            </div>
                                            <label className="custom-file-upload-face">
                                                <input accept="image/png, image/jpeg" type="file" onChange={changeHandlerFaceTwo} />
                                                Upload File
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {
                            (props.itemkey === 'ppe-detection') && (
                                <>
                                    <div className="detail-image-placeholder-container">
                                        {
                                            (selectedMainPhoto) ? (
                                                <div width='210' height='230'>
                                                    <img src={selectedMainPhoto} alt="placeholder" width='100%'/>
                                                </div>
                                            ) : (
                                                <img src={imagePlaceholder} alt="placeholder"/>
                                            )
                                        }
                                    </div>
                                    <label className="custom-file-upload-face">
                                        <input accept="image/png, image/jpeg" type="file" onChange={changeHandler} />
                                        Upload File
                                    </label>
                                </>
                            )
                        }
                        {
                            ((props.itemkey !== 'faces-comparison') && (props.itemkey !== 'ppe-detection')) && (
                                <div className="detail-image-placeholder-container">
                                    {
                                        (selectedMainPhoto) ? (
                                            <div width='300' height='311'>
                                                <img src={selectedMainPhoto} alt="placeholder" width='100%'/>
                                            </div>
                                        ) : (
                                            <img src={imagePlaceholder} alt="placeholder"/>
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div className={(resultFlag) ? "col-sm-12 col-md-5 col-lg-5" : "col-sm-12 col-md-6 col-lg-6"}>
                        <h4 className="item-heading">{heading}</h4>
                        <p className="item-description">{description}</p>
                        <p className="warning-msg">Image must be .jpeg or .png format and no larger than 5MB. Your image isn't stored.</p>
                        {
                            (faceFlag) && (
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                    {
                                        (selectedCollection) ? (
                                            selectedCollection.collectionName
                                        ) : (
                                            'Select Collection'
                                        )
                                    }
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {
                                            allCollection.map((item, index) => (
                                                <Dropdown.Item key={index} onClick={(e) => setSelectedCollection(item)}>{item.collectionName}</Dropdown.Item>
                                            ))
                                        }
                                    </Dropdown.Menu>
                                </Dropdown>
                            )
                        }
                        <div className={(props.itemkey === 'ppe-detection') ? "file-upload-div-ppe" : "file-upload-div"}>
                            {
                                ((props.itemkey !== 'faces-comparison') && (props.itemkey !== 'ppe-detection')) && (
                                    <label className="custom-file-upload">
                                        <input accept="image/png, image/jpeg" type="file" onChange={changeHandler} />
                                        Upload File
                                    </label>
                                )
                            }
                            {
                                (props.itemkey === 'ppe-detection') && (
                                    <ResultsCheckboxes checkboxes={resultsCheckboxes}/>
                                )
                            }
                            <div className="navigate-button">
                                <Button text="GO" onClick={buttonClick}/>
                            </div>
                        </div>
                    </div>
                    {
                        ((props.itemkey === 'label_detect') && (resultFlag)) && (
                            <div className="col-sm-12 col-md-3 col-lg-3">
                                <h5 className="results-heading">Results</h5>
                                <ResultsData result={labelDetecResult} />
                            </div>
                        )
                    }
                    {
                        (((props.itemkey === 'facial-analysis') || (props.itemkey === 'ppe-detection')) && (resultFlag)) && (
                            <div className="col-sm-12 col-md-3 col-lg-3">
                                <h5 className="results-heading">Results</h5>
                                <ResultsImages images={imageListOfResults} returnImage={getSelectedFaceForFaceAnalysis}/>
                            </div>
                        )
                    }
                </div>
                {
                    ((props.itemkey === 'facial-analysis') && (resultFlag)) && (
                        <div className="face-results-div">
                            <h5 className="results-heading">Selected Face Results</h5>
                            <div className="row">
                                <div className="col-sm-12 col-md-5 col-lg-5">
                                    <ResultsData result={selectedFace?.first} />
                                </div>
                                <div className="col-sm-12 col-md-4 col-lg-4">
                                    <ResultsData result={selectedFace?.second} />
                                </div>
                                <div className="col-sm-12 col-md-3 col-lg-3">
                                    <ResultsData result={selectedFace?.third} />
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    ((props.itemkey === 'faces-comparison') && (resultFlag)) && (
                        <div className="face-results-div">
                            <h5 className="results-heading">Selected Face Results</h5>
                            <h5 className="results-heading results-heading-secondary">Face Matches</h5>
                            <div className="container">
                                <div className="row">
                                    <div className="col-sm-12 col-md-6 col-lg-6">
                                        <ResultsImages images={imageListOfResults} returnImage={getSelectedFaceForFaceCompare}/>
                                    </div>
                                    <div className="col-sm-12 col-md-6 col-lg-6">
                                        <ResultsData result={selectedSimilarity} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    ((props.itemkey === 'ppe-detection') && (resultFlag)) && (
                        <div className="face-results-div">
                            <h5 className="results-heading">Selected Face Results</h5>
                            <div className="row">
                                <div className="col-sm-12 col-md-4 col-lg-4">
                                    <ResultsData result={selectedFace.first} />
                                </div>
                                <div className="col-sm-12 col-md-4 col-lg-4">
                                    <ResultsData result={selectedFace.second} />
                                </div>
                                <div className="col-sm-12 col-md-4 col-lg-4">
                                    <ResultsData result={selectedFace.third} />
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    (faceFlag) && (resultFlag) && (
                        <div className="face-results-div">
                            <h5 className="results-heading">Result</h5>
                            <div className="row">
                                <div className="col-12">
                                <div className="result-face-data-div">
                                    <div className="face-detail-item">
                                        {   
                                            (selectedCollection) ? (
                                                <h4>Face found in Collection {selectedCollection.collectionName}</h4>
                                            ) : (
                                                <h4>Face found in Collection</h4>
                                            ) 
                                        }
                                        <div className="row">
                                            <div className="col-md-6 col-lg-6 col-sm-12">
                                                <div className="detail-image-placeholder-container">
                                                    <img src={s3ObjectImage(faceMatchAPIResult.photoUrl)} width='100%' alt="placeholder" />
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-lg-6 col-sm-12">
                                                <p className="desc-text">Similarity : <label style={{color: '#f5ac47'}}>{faceMatchResult.Similarity}</label></p>
                                                <p className="desc-text">Full Name : {faceMatchAPIResult.fullName}</p>
                                                <p className="desc-text">Email Address: {faceMatchAPIResult.emailAddress}</p>
                                                <p className="desc-text">Face Id : {faceMatchAPIResult.faceId}</p>
                                                <p className="desc-text">External Id : {faceMatchAPIResult.externalId}</p>
                                                <p className="desc-text">Created at: {faceMatchAPIResult.createdAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    ((props.itemkey === 'text-detection') && (resultFlag)) && (
                        <div className="face-results-div">
                            <h5 className="results-heading">Text Results</h5>
                            <div className="row">
                                <div className="col-sm-6">
                                    <p>Detect text type by Line</p>
                                    <ResultsData result={allDetectedText?.line} />
                                </div>
                                <div className="col-sm-6">
                                    <p>Detect text type by Word</p>
                                    <ResultsData result={allDetectedText?.word} />
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
            <Modal show={loading} centered>
                <div className="d-flex flex-column align-items-center">
                <ScaleLoader color={primaryColor} loading={loading} css={override} size={150} />
                <div>
                <p>Loading...</p>
                </div>
                </div>
            </Modal>
        </>
    )
}