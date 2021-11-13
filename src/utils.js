import placeholderImage from "./assets/images/imagePlaceholder.svg";

export const DATE_OPTIONS = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString

export const loadingMessageForFaceAnalysisOrPPE = {
  first:[
    {
    name: "General Loading...",
    value: " "
    }
  ],
  second:[
    {
    name: "Feature Loading...",
    value: " "
    }
  ],
  third: [
    {
    name: "Emotions Loading...",
    value: " "
    }
  ]
};

export const loadingMessage = {
  name: "Loading...",
  value: " ",
};

export const pages = [
  {
    key: "label_detect",
    imageName: "label_detect.png",
    heading: "Object and scene detection",
    description:
      "With Object and scene detection, you can identify thousands of objects (such as bike, telephone, building), and scenes (such as parking lot, beach, city).",
  },
  {
    key: "facial-analysis",
    imageName: "Face-Analysis.png",
    heading: "Facial analysis",
    description:
      "With Facial Analysis, you can easily detect when faces appear in images and videos and get attributes such as gender, age range, eyes open, glasses, facial hair for each.",
  },
  {
    key: "faces-search-verification",
    imageName: "Face-search.png",
    heading: "Face search and verification",
    description:
      "Face search verification provides fast and accurate face search, allowing you to identify a person in a photo using your private repository of face images.",
  },
  {
    key: "ppe-detection",
    imageName: "worker-with-bb.png",
    heading: "Personal Protective Equipment (PPE) detection",
    description:
      "Automatically detect Personal Protective Equipment (PPE) such as face covers, head covers, and hand covers on persons in images.",
  },
  {
    key: "faces-comparison",
    imageName: "face_compare.png",
    heading: "Face comparison",
    description:
      "Compare faces to see how closely they match based on a similarity percentage.",
  },
  {
    key: "text-detection",
    imageName: "rekognition-text-detection.png",
    heading: "Text detection",
    description:
      "Rekognition can detect text in images. It can then convert the detected text into machine-readable text.",
  }
];

export const resultsData = [
  {
    key: "label_detect",
    values: [
      {
        name: "Car",
        value: "98.9%",
      },
      {
        name: "Automobile",
        value: "98.9 %",
      },
      {
        name: "Vehicle",
        value: "98.9 %",
      },
      {
        name: "Person",
        value: "95.9 %",
      },
    ],
  },
  {
    key: "facial-analysis",
    values: [
      {
        first: [
          {
            name: "looks like a face",
            value: "98.9 %",
          },
          {
            name: "appears to be female",
            value: "98.9 %",
          },
          {
            name: "age range",
            value: "5 - 15 years old",
          },
          {
            name: "smiling",
            value: "99.9 %",
          },
          {
            name: "appears to be happy",
            value: "98.9 %",
          },
        ],
      },
      {
        second: [
          {
            name: "mouth is open",
            value: "99.9 %",
          },
          {
            name: "does not have a mustache",
            value: "98.9 %",
          },
          {
            name: "does not have a beard",
            value: "98.9 %",
          },
          {
            name: "eyes are open",
            value: "97.9 %",
          },
          {
            name: "wearing glasses",
            value: "99.9 %",
          },
          {
            name: "wearing sunglasses",
            value: "99.9 %",
          },
        ],
      },
      {
        third: [
          {
            name: "HAPPY",
            value: "92.9 %",
          },
          {
            name: "SURPRISED",
            value: "70.9 %",
          },
          {
            name: "CONFUSED",
            value: "70.9 %",
          },
          {
            name: "ANGRY",
            value: "40.9 %",
          },
          {
            name: "CALM",
            value: "30.9 %",
          },
          {
            name: "FEAR",
            value: "30.9 %",
          },
        ],
      },
    ],
  },
  {
    key: "faces-comparison",
    values: [
      {
        name: "Similarity",
        value: "98.9 %",
      },
      {
        name: "Confidence",
        value: "98.9 %",
      },
    ],
  },
  {
    key: "ppe-detection",
    values: [
      {
        first: [
          {
            name: "Person detected",
            value: "98.9 %",
          },
          {
            name: "Face detected",
            value: "98.9 %",
          },
          {
            name: "Face cover detected",
            value: "99.6 %",
          },
          {
            name: "Face cover on nose",
            value: "99.9 %",
          },
        ],
      },
      {
        second: [
          {
            name: "Left hand detected",
            value: "99.9 %",
          },
          {
            name: "Hand cover on left hand : true",
            value: "98.9 %",
          },
          {
            name: "Right hand detected",
            value: "98.9 %",
          },
          {
            name: "Hand cover on right hand",
            value: "97.9 %",
          },
        ],
      },
      {
        third: [
          {
            name: "Head detected",
            value: "92.9 %",
          },
          {
            name: "Head cover detected",
            value: "70.9 %",
          },
          {
            name: "Head cover on head",
            value: "70.9 %",
          },
        ],
      },
    ],
  },
];

export const resultsImages = [
  placeholderImage,
  placeholderImage,
  placeholderImage,
  placeholderImage,
  placeholderImage,
];

export const resultsCheckboxes = ["FACE COVER", "HAND COVER", "HEAD COVER"];

export const faceSearchItems = [
  {
    key: "manage-face-collection",
    image: "faceAddWithColletion.png",
    heading: "Manage Faces and Collections",
  },
  {
    key: "search-face-by-image",
    image: "Face-search.png",
    heading: "Search Face From List By Image",
  },
];

export const faceCollectionData = [
    {
        name: 'USA Office',
        id: 'XXDSD222',
        createdAt: '09:54 AM 02/06/2021'
    },
    {
        name: 'Torronto Office',
        id: 'CCDSD222',
        createdAt: '09:54 AM 02/06/2021'
    },
    {
        name: 'Head Office',
        id: 'CCDSD222',
        createdAt: '09:54 AM 02/06/2021'
    },
    {
        name: 'Marine Square',
        id: 'CCDSD222',
        createdAt: '09:54 AM 02/06/2021'
    }
];

export const faceCollectionIDData = [
  {
      name: 'ABC',
      id: '0b683aed-a0f1-48b2-9b5e-139e9cc2a757',
      createdAt: '09:54 AM 02/06/2021'
  },
  {
      name: 'DEF',
      id: '0b683aed-a0f1-48b2-9b5e-139e9cc2a757',
      createdAt: '09:54 AM 02/06/2021'
  },
  {
      name: 'GHQ',
      id: '0b683aed-a0f1-48b2-9b5e-139e9cc2a757',
      createdAt: '09:54 AM 02/06/2021'
  },
  {
      name: 'XYQ',
      id: '0b683aed-a0f1-48b2-9b5e-139e9cc2a757',
      createdAt: '09:54 AM 02/06/2021'
  },
  {
      name: 'IUY',
      id: '0b683aed-a0f1-48b2-9b5e-139e9cc2a757',
      createdAt: '09:54 AM 02/06/2021'
  },

];


