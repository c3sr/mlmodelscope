// import Chair1 from "./chair/images/chair1.png";
// import Chair2 from "./chair/images/chair2.png";
// import Chair3 from "./chair/images/chair3.png";
// import Chair4 from "./chair/images/chair4.png";
// import Chair5 from "./chair/images/chair5.png";
// import Chair3DOBJ from "./chair/object/chairs.obj";
// import Chair3DMTL from "./chair/object/chairs.mtl";


export const TestMaskGenerationOutputGeneratedToken = {
    id: "sampleMaskGenerationTokenIdHere"
};

export const TestMaskGenerationOutput = {
    id: "sampleMaskGenerationOutputIdHere",
    inputs: [
        {
            src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/plane-blue.jpg",
            alt: "plane",
            type: "IMAGE",
            xmax: 718,
            xmin: 45,
            ymax: 439,
            ymin: 90
        },             
    ],
    completed_at: "2023-06-03T18:17:14.513854Z",
    results: { 
        'duration': "9.216154124s", 
        'duration_for_inference': "9.193807904s", 
        'responses': [
            {
                'features': [
                    {
                        src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/plane-blue.jpg",
                        type: "IMAGE",
                        xmax: 720,
                        xmin: 32,
                        ymax: 410,
                        ymin: 95,
                        label: "airplane",
                        probability: 0.98
                    },
                ], 
                'id': "sampleMaskGenerationOutputResponseIdHere"
            }
        ]
    }
}