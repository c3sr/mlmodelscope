import { textToCode } from "../../../../../../helpers/TaskIDs";

export const TestTextToCodeOutput = {
  id: "9d52d414-cc78-4cd5-a292-afdc0b9332ec",
  inputs: [
    { src: "write an iterator that squares each element of a list of numbers and returns an iterator of the squares." },
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
            text: `class PowTwo:
    """Class to implement an iterator
    of powers of two"""

    def __init__(self, max=0):
        self.max = max

    def __iter__(self):
        self.n = 0
        return self

    def __next__(self):
        if self.n <= self.max:
            result = 2 ** self.n
            self.n += 1
            return result
        else:
            raise StopIteration


# create an object
numbers = PowTwo(3)

# create an iterable from the object
i = iter(numbers)

# Using next to get to the next iterator element
print(next(i)) # prints 1
print(next(i)) # prints 2
print(next(i)) # prints 4
print(next(i)) # prints 8
print(next(i)) # raises StopIteration exception`,
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
      type: textToCode,
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
