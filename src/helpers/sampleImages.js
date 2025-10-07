import StyleTransferContent from "../resources/taskSample/styleTransferContent.jpg";
import StyleTransferStyle from "../resources/taskSample/styleTransferStyle.jpg";
import Chairs from "../resources/taskSample/imageTo3D1.png";
import Drums from "../resources/taskSample/imageTo3D2.png";
import catDog from "../stories/assets/catdog.jpg";
import tableEditing from "../../src/resources/taskSample/tableEditing.csv";

export const SampleImageEnhancementInputs = [
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/license-plate.png",
    alt: "car with license plate",
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/forest-mountaings.png",
    alt: "mountain with a forest",
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/yellow-bird.png",
    alt: "yellow bird",
  },
];
export const SampleSegmentationInputs = [
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/bicycle.png",
    alt: "bicycle",
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/plane.png",
    alt: "airplane",
  },

  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/cats-dogs.png",
    alt: "cat and dog",
  },
];

export const SampleImageClassificationInputs = [
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/birdy.png",
    alt: "bird",
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/kitty.png",
    alt: "cat",
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/crabby.png",
    alt: "crab",
  },
];

export const SampleObjectDetectionInputs = [
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/obj-1.jpg",
    alt: "people sitting around a table",
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/obj-2.jpg",
    alt: "storefront of a restaurant",
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/obj-3.jpg",
    alt: "crosswalk",
  },
];

export const SampleInstanceSegmentationInputs = [
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/person-dog.jpg",
    alt: "person with a dog",
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/puppies.jpg",
    alt: "puppies",
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/plane-blue.jpg",
    alt: "airplane",
  },
];

export const SampleStyleTransferInputs = [
  [
    {
      src: StyleTransferContent,
      alt: "yellow dog",
    },
  ],
  [
    {
      src: StyleTransferStyle,
      alt: "painting"
    },
  ]
];

export const SampleImageTo3DInputs = [
  [
    {
      src: Chairs,
      alt: "chairs",
    },
    {
      src: Drums,
      alt: "drums",
    },           
  ],
];

export const SampleMaskGenerationInputs = [
  [
    {
      src: catDog,
      alt: "cat and dog",
    },
  ]
];

export const SampleTextInputs = [
  { src: "Lorem ipsum dolor sit amet" },
  { src: "Consectetur adipiscing elit" },
  { src: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua" },
];

export const SampleTextToCodeInputs = [
  { src: "Lorem ipsum dolor sit amet" },
  { src: "Consectetur adipiscing elit" },
  { src: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua" },
];

export const SampleAudioToTextInputs = [
  {
    title: "automatic-speech-recognition-input.flac",
    src: "https://xlab1.netlify.app/automatic-speech-recognition-input.flac"
  },
  {
    title: "demo1.mp3",
    src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3"
  },
  ,
  {
    title: "demo2.mp3",
    src: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3"
  },
];

export const SampleTextConversationInputs = [
  { src: "Show me a recipe for pizza" },
  { src: "What is the weather tomorrow?" },
  { src: "What is the meaning of life?", }
];
export const SampleVisualQuestionAnsweringInputs = [
  [{
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/birdy.png",
    alt: "bird"
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/kitty.png",
    alt: "cat"
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/crabby.png",
    alt: "crab"
  }
  ],
  [
    { src: "What is the color of the bird?" },
    { src: "What is the animal in the image?" },
    { src: "Where is the crab?" }
  ]
];
export const SampleTextGuidedImageToImageInputs = [
  [{
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/birdy.png",
    alt: "bird"
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/kitty.png",
    alt: "cat"
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/crabby.png",
    alt: "crab"
  }
  ],
  [
    { src: "Replace the background with a beach." },
    { src: "Make the animal look like a cartoon." },
    { src: "Make the image look like a painting." }
  ]
];
export const SampleDocumentQuestionAnsweringInputs = [
  [{
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/birdy.png",
    description: "Bird"
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/kitty.png",
    description: "Cat"
  },
  {
    src: "https://xlab1.netlify.app/samples/PDF/invoice.pdf",
    description: "Sample Invoice"
  }
  ],
  [
    { src: "What is the color of the bird?" },
    { src: "What is the animal in the image?" },
    { src: "What is the total amount in the invoice?" }
  ]
];

export const SampleTextToImageInputs = [
  { src: "Cat and dog playing" },
  { src: "Flower in a garden" },
  { src: "Sunset on a beach" }
];
export const SampleTextToVideoInputs = [
  { src: "Cat and dog playing" },
  { src: "Flower in a garden" },
  { src: "Sunset on a beach" }
];

export const SampleImageToTextInputs = [
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/birdy.png",
    alt: "bird"
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/kitty.png",
    alt: "cat"
  },
  {
    src: "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/crabby.png",
    alt: "crab"
  }
];

export const SampleTextTo3DInputs = [
  { src: "a cool drum set" }
];

export const SampleTextClassificationInputs = [
  { src: "The weather is very pleasant today." },
  { src: "The ending of the movie was sad." },
  { src: "There is a car parked there." },
];

export const SampleAudioToAudioInputs = [
  {
    title: "audio1.flac",
    src: "https://xlab1.netlify.app/audio-to-audio-input.flac"

  },
  {
    title: "demo1.mp3",
    src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3"
  },
  ,
  {
    title: "demo2.mp3",
    src: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3"
  },
];
export const SampleAudioClassificationInputs = [
  {
    title: "audio1.flac",
    src: "https://xlab1.netlify.app/audio-classification-input.flac"

  },
  {
    title: "demo1.mp3",
    src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3"
  },
  ,
  {
    title: "demo2.mp3",
    src: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3"
  },
];
export const SampleTextToAudio = [
  { src: "a chill song with influences from lofi, chillstep and downtempo" },
];

export const SampleVideoClassificationInputs = [
  {
    description: "Video of a cat",
    src: "https://xlab1.netlify.app/samples/video/cat.mp4"

  },
  {
    description: "Video of a ocean",
    src: "https://xlab1.netlify.app/samples/video/ocean.mp4"

  },
  {
    description: "Video of a flower",
    src: "https://xlab1.netlify.app/samples/video/flower.mp4"
  },
];

export const SampleTableEditingInputs = [
  [
    {
      src: tableEditing,
      description: "Client List"
    },
  ]
];