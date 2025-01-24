import { textToText } from "../../../../../../helpers/TaskIDs";

export const TestTextOutputGeneratedToken = {
  id: "9d52d414-cc78-4cd5-a292-afdc0b9332ec",
  inputs: ["translate English to German: The house is wonderful."],
  completed_at: "2022-06-03T18:17:14.513854Z",
  results: {
    duration: "9.216154124s",
    duration_for_inference: "9.193807904s",
    responses: [
      {
        features: [
          {
            id: "62a9f38e2bbc470001e3ce98",
            type: "GENERATEDTOKENS",
            generated_tokens: [
              {
                index: 644,
                token: "Das",
                logits: -0.666,
                probability: 0.514,
              },
              {
                index: 4598,
                token: "Haus",
                logits: -0.151,
                probability: 0.86,
              },
              {
                index: 229,
                token: "ist",
                logits: -0.055,
                probability: 0.947,
              },
              {
                index: 19250,
                token: "wunderbar",
                logits: -0.56,
                probability: 0.571,
              },
              {
                index: 5,
                token: ".",
                logits: -0.076,
                probability: 0.927,
              },
            ],
          },
        ],
      },
    ],
    trace_id: {},
  },
  model: {
    id: 206,
    created_at: "2022-04-29T20:49:01.393746Z",
    updated_at: "2022-04-29T20:49:01.393746Z",
    attributes: {
      Top1: "",
      Top5: "",
      kind: "CNN",
      manifest_author: "Cheng Li",
      training_dataset: "COCO",
    },
    description:
      "TensorFlow Instance Segmentation model, which is trained on the COCO (Common Objects in Context) dataset. Use mask_rcnn_inception_v2_coco_2018_01_28 from TensorFlow detection model zoo.\n",
    short_description:
      "Mast_RCNN is a conceptually simple, flexible, and general framework for object instance segmentation. It   detects objects in an image while simultaneously generating a high-quality segmentation mask for each in- stance.",
    model: {
      graph_checksum: "b47e443b313a709e4c39c1caeaa3ecb3",
      graph_path:
        "https://s3.amazonaws.com/store.carml.org/models/tensorflow/models/mask_rcnn_inception_v2_coco_2018_01_28/frozen_inference_graph.pb",
      weights_checksum: "",
      weights_path: "",
    },
    framework: {
      id: 4,
      name: "TensorFlow",
      version: "1.14.0",
      architectures: [
        {
          name: "amd64",
        },
      ],
    },
    input: {
      description: "",
      type: "",
    },
    license: "Apache License, Version 2.0",
    name: "Mask_RCNN_Inception_v2_COCO",
    output: {
      description: "the output instance segment",
      type: "image_instance_segmentation",
    },
    url: {
      github:
        "https://github.com/tensorflow/models/blob/master/research/object_detection/samples/configs/mask_rcnn_inception_v2_coco.config",
      citation: "https://arxiv.org/abs/1703.06870",
      link1: "",
      link2: "",
    },
    version: "1.0",
  },
};
export const TestTextOutput = {
  id: "9d52d414-cc78-4cd5-a292-afdc0b9332ec",
  inputs: [
    { src: 'translate English to German: "Luigi often said to me that he never wanted the brothers to end up in court," she wrote.' },
  ],
  completed_at: "2022-06-03T18:17:14.513854Z",
  results: {
    duration: "9.216154124s",
    duration_for_inference: "9.193807904s",
    responses: [
      {
        features: [
          {
            id: "62a9f38e2bbc470001e3ce98",
            type: "TEXT",
            text: "Luigi sagte mir oft, er wollte nie, dass die Brüder vor",
          },
        ],
      },
    ],
    trace_id: {},
  },
  model: {
    id: 206,
    created_at: "2022-04-29T20:49:01.393746Z",
    updated_at: "2022-04-29T20:49:01.393746Z",
    attributes: {
      Top1: "",
      Top5: "",
      kind: "CNN",
      manifest_author: "Cheng Li",
      training_dataset: "COCO",
    },
    description:
      "TensorFlow Instance Segmentation model, which is trained on the COCO (Common Objects in Context) dataset. Use mask_rcnn_inception_v2_coco_2018_01_28 from TensorFlow detection model zoo.\n",
    short_description:
      "Mast_RCNN is a conceptually simple, flexible, and general framework for object instance segmentation. It   detects objects in an image while simultaneously generating a high-quality segmentation mask for each in- stance.",
    model: {
      graph_checksum: "b47e443b313a709e4c39c1caeaa3ecb3",
      graph_path:
        "https://s3.amazonaws.com/store.carml.org/models/tensorflow/models/mask_rcnn_inception_v2_coco_2018_01_28/frozen_inference_graph.pb",
      weights_checksum: "",
      weights_path: "",
    },
    framework: {
      id: 4,
      name: "TensorFlow",
      version: "1.14.0",
      architectures: [
        {
          name: "amd64",
        },
      ],
    },
    input: {
      description: "",
      type: "",
    },
    license: "Apache License, Version 2.0",
    name: "Mask_RCNN_Inception_v2_COCO",
    output: {
      description: "the output instance segment",
      type: textToText,
    },
    url: {
      github:
        "https://github.com/tensorflow/models/blob/master/research/object_detection/samples/configs/mask_rcnn_inception_v2_coco.config",
      citation: "https://arxiv.org/abs/1703.06870",
      link1: "",
      link2: "",
    },
    version: "1.0",
  },
};
