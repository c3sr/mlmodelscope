import React from "react";
import InputPreview from "./InputPreview";
import MultiInputPreview from "./MultiInputPreview";
import ClassificationOutput from "./Outputs/Classification/ClassificationOutput";
import PendingOutput from "./Outputs/Classification/PendingOutput";
import {
  image_classification,
  image_enhancement,
  instance_segmentation,
  object_detection,
  semantic_segmentation,
  textToText,
  textToCode,
  styleTransfer,
  imageTo3D,
  audioToText,
  textToAudio,
  textConversation,
  textGuidedImageToImage,
  visualQuestionAnswering,
  documentQuestionAnswering,
  textToVideo,
  textTo3D,
  textClassification,
  imageToText,
  audioClassification,
  textToImage,
  audioToAudio,
  videoClassification,
  tableEditing,
  audioDiarization
} from "../../../helpers/TaskIDs";
import ObjectDetection from "./Outputs/ObjectDetection/ObjectDetection";
import ImageEnhancement from "./Outputs/ImageEnhancement/ImageEnhancement";
import SemanticSegmentation from "./Outputs/SemanticSegmentation/SemanticSegmentation";
import ProcessFailed from "./ProcessFailed";
import "./QuickOutput.scss";
import useBEMNaming from "../../../common/useBEMNaming";
import TextOutput from "./Outputs/Text/TextOutput";
// import { TextToCode } from "../../ModelDetailPage/ModelDetailPage.stories"; Unused
import TextToCodeOutput from "./Outputs/TextToCode/TextToCodeOutput";
import TextConversationOutput from "./Outputs/TextConversation/TextConversationOutput";
import StyleTransferOutput from "./Outputs/StyleTransfer/StyleTransferOutput";
import TextGuidedImageToImageOutput from "./Outputs/TextGuidedImageToImage/TextGuidedImageToImageOutput";
import VisualQuestionAnsweringOutput from "./Outputs/VisualQuestionAnswering/VisualQuestionAnsweringOutput";
import DocumentQuestionAnsweringOutput from "./Outputs/DocumentQuestionAnswering/DocumentQuestionAnsweringOutput";
import TextToVideoOutput from "./Outputs/TextToVideo/TextToVideoOutput";
import TextToImageOutput from "./Outputs/TextToImage/TextToImageOutput";
import TextClassificationOutput from "./Outputs/TextClassification/TextClassificationOutput";
import ImageToTextOutput from "./Outputs/ImageToText/ImageToTextOutput";
import ImageTo3DOutput from "./Outputs/ImageTo3D/ImageTo3DOutput";
import TextTo3DOutput from "./Outputs/TextTo3D/TextTo3DOutput";
import AudioToTextOutput from "./Outputs/AudioToText/AudioToTextOutput";
import AudioDiarizationOutput from "./Outputs/AudioDiarization/AudioDiarizationOutput";
import TextToAudioOutput from "./Outputs/TextToAudio/TextToAudioOutput";
import AudioClassificationOutput from "./Outputs/AudioClassification/AudioClassificationOutput";
import AudioToAudioOutput from "./Outputs/AudioToAudio/AudioToAudioOutput";
import VideoClassificationOutput from "./Outputs/VideoClassification/VideoClassificationOutput";
import TableEditingOutput from "./Outputs/TableEditing/TableEditingOutput";
import ExplanationPanel from "./Outputs/Classification/ExplanationPanel";
import TextExplanationPanel from "./Outputs/Text/TextExplanationPanel";
import InteractiveExplanationPanel from "./InteractiveExplanation/InteractiveExplanationPanel";
import {
  InteractiveExplanationProvider,
  useInteractiveExplanation
} from "./InteractiveExplanation/InteractiveExplanationContext";
import TextSelectionExplanation from "./InteractiveExplanation/TextSelectionExplanation";
import { isTokenProbabilitySupportedModel } from "../../../helpers/explanation";


const defaultProps = {
  className: "quick-output",
  features: [],
  input: "",
  compare: () => { },
  processFailed: false,
  inputType: "image", // Todo: Change this default?
};

const defaultGradCAMQuestion = "What do these visual explanations tell me about this prediction?";
const defaultClassificationQuestion = "How should I interpret this classification and its probability?";
const defaultResultQuestion = "What are the most important things to understand about this result?";
const defaultTokenQuestion = "Why was this token selected here?";
const maxTextContextLength = 2000;

const makeImageAttachment = (artifact, role, description) => artifact?.data ? ({
  role,
  mimeType: artifact.mimeType || "image/png",
  description,
  data: artifact.data
}) : null;

function ExistingExplanation({ explanation, interactiveArtifacts }) {
  const { selectArtifact } = useInteractiveExplanation();

  const explainEvidence = ({ classResult, evidenceView }) => {
    const artifact = interactiveArtifacts.find((candidate) =>
      candidate.kind === "classification_gradcam" &&
      candidate.selection.classIndex === classResult.index &&
      candidate.selection.view === evidenceView
    );
    if (artifact)
      selectArtifact(artifact, defaultGradCAMQuestion);
  };

  return (
    <ExplanationPanel
      explanation={explanation}
      onExplainEvidence={explainEvidence}
    />
  );
}

function ExistingTextExplanation({ explanation, interactiveArtifacts }) {
  const { selectArtifact } = useInteractiveExplanation();
  const hasTokenDecisionArtifacts = interactiveArtifacts.some((artifact) => artifact.kind === "token_decision");

  const explainToken = (token) => {
    const artifact = interactiveArtifacts.find((candidate) =>
      candidate.kind === "token_decision" &&
      candidate.selection.position === token.position &&
      candidate.selection.tokenId === token.id
    );
    if (artifact)
      selectArtifact(artifact, defaultTokenQuestion);
  };

  return (
    <TextExplanationPanel
      explanation={explanation}
      onExplainToken={hasTokenDecisionArtifacts ? explainToken : undefined}
    />
  );
}

function ContextualClassificationOutput({ features, trial, interactiveArtifacts }) {
  const { selectArtifact } = useInteractiveExplanation();

  const findClassificationArtifact = (feature, featureIndex) => {
    const classIndex = feature.classification?.index ?? featureIndex;
    return interactiveArtifacts.find((artifact) =>
      artifact.kind === "classification" &&
      artifact.selection.scope !== "result" &&
      artifact.selection.classIndex === classIndex
    );
  };

  const explainPrediction = (feature, featureIndex) => {
    const artifact = findClassificationArtifact(feature, featureIndex);
    if (artifact)
      selectArtifact(artifact, defaultClassificationQuestion);
  };

  const explainResult = () => {
    const artifact = interactiveArtifacts.find((candidate) =>
      candidate.kind === "classification" && candidate.selection.scope === "result"
    );
    if (artifact)
      selectArtifact(artifact, defaultResultQuestion);
  };

  return (
    <ClassificationOutput
      features={features}
      trial={trial}
      onExplainPrediction={explainPrediction}
      onAskAIAboutResult={explainResult}
      explainablePredictionCount={5}
    />
  );
}

export default function QuickOutput(givenProps) {
  const props = { ...defaultProps, ...givenProps };
  const { getElement, getBlock } = useBEMNaming(props.className);
  const explanation = props.trialOutput?.results?.explanation;
  const showExplanation =
    !props.processFailed &&
    [image_classification, textToText].includes(props.trialOutput?.model?.output?.type) &&
    explanation;
  const topPredictions = props.trialOutput?.model?.output?.type === image_classification
    ? (props.features || []).slice(0, 5).map((prediction, predictionIndex) => ({
      index: prediction.classification?.index ?? predictionIndex,
      label: prediction.classification?.label || `Class ${prediction.classification?.index ?? predictionIndex}`,
      probability: prediction.probability
    }))
    : [];
  const classificationArtifacts = props.trialOutput?.model?.output?.type === image_classification
    ? (props.features || []).slice(0, 5).map((feature, index) => {
      const classification = feature.classification || {};
      return {
        id: `classification-${classification.index ?? index}`,
        label: classification.label || `Class ${classification.index ?? index}`,
        kind: "classification",
        selection: {
          classIndex: classification.index ?? index,
          label: classification.label
        },
        structuredData: {
          predictions: topPredictions
        },
        model: {
          name: props.trialOutput.model.name,
          task: props.trialOutput.model.output.type,
          framework: props.trialOutput.model.framework?.name,
          frameworkVersion: props.trialOutput.model.framework?.version
        }
      };
    })
    : [];
  const resultArtifact = classificationArtifacts.length > 0
    ? [{
      ...classificationArtifacts[0],
      id: "classification-result",
      label: "Overall classification result",
      selection: {
        ...classificationArtifacts[0].selection,
        scope: "result"
      }
    }]
    : [];
  const gradCAMArtifacts = props.trialOutput?.model?.output?.type === image_classification
    ? (explanation?.classes || []).flatMap((classResult) => {
      const focusArtifact = classResult.focusMask || classResult.overlay;
      const heatmapArtifact = classResult.heatmap || classResult.overlay;
      const structuredData = {
        probability: classResult.probability,
        rank: classResult.rank,
        logit: classResult.logit,
        predictions: topPredictions,
        method: explanation.method,
        targetLayer: explanation.pipeline?.inference?.targetLayer || explanation.targetLayer,
        comparison: explanation.comparison
      };
      const existingXai = {
        status: explanation.status,
        method: explanation.method,
        targetLayer: explanation.pipeline?.inference?.targetLayer || explanation.targetLayer,
        limitations: explanation.limitations || []
      };
      const model = {
        name: props.trialOutput.model.name,
        task: props.trialOutput.model.output.type,
        framework: props.trialOutput.model.framework?.name,
        frameworkVersion: props.trialOutput.model.framework?.version
      };
      const makeArtifact = (view, visualArtifact, role, description) => {
        const attachment = makeImageAttachment(visualArtifact, role, description);
        if (!attachment) return null;
        return {
          id: `gradcam-${classResult.index}-${view}`,
          label: `Grad-CAM evidence for "${classResult.label}"`,
          kind: "classification_gradcam",
          selection: {
            classIndex: classResult.index,
            label: classResult.label,
            view
          },
          structuredData,
          existingXai,
          model,
          attachments: [attachment]
        };
      };
      return [
        makeArtifact("focus", focusArtifact, "focus_mask", "Focus-area Grad-CAM visualization for the selected class"),
        makeArtifact("intensity", heatmapArtifact, "heatmap", "Grad-CAM intensity map for the selected class")
      ].filter(Boolean);
    })
    : [];
  const tokenDecisionArtifacts = isTokenProbabilitySupportedModel(props.trialOutput?.model)
    ? makeTokenDecisionArtifacts(props.trialOutput, explanation)
    : [];
  const interactiveArtifacts = [
    ...resultArtifact,
    ...classificationArtifacts,
    ...gradCAMArtifacts,
    ...tokenDecisionArtifacts
  ];
  const explanationPanel = props.trialOutput?.model?.output?.type === textToText
    ? <ExistingTextExplanation
      explanation={explanation}
      interactiveArtifacts={interactiveArtifacts}
    />
    : <ExistingExplanation
      explanation={explanation}
      interactiveArtifacts={interactiveArtifacts}
    />;

  const preview = props?.trialOutput?.inputs.length > 1 ? <MultiInputPreview inputs={props.trialOutput.inputs} onBackClicked={props.onBackClicked} /> : (
    <InputPreview
      input={props.input}
      onBackClicked={props.onBackClicked}
      inputType={props.inputType}
    />
  );

  const makeOutput = () => {
    if (props.processFailed) {
      return (
        <>
          {preview}
          <ProcessFailed />
        </>
      );
    } else if (props.features || props.trialOutput.completed_at) {
      switch (props.trialOutput.model.output.type) {
        case image_classification:
          return (
            <>
              {preview}
              <ContextualClassificationOutput
                features={props.features}
                trial={props.trialOutput}
                interactiveArtifacts={interactiveArtifacts}
              />
            </>
          );
        case image_enhancement:
          return (
            <>
              <ImageEnhancement
                trial={props.trialOutput}
                onBackClicked={props.onBackClicked}
                feature={props.trialOutput.results.responses[0].features[0]}
              />
            </>
          );
        case object_detection:
          return (
            <ObjectDetection
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case semantic_segmentation:
        case instance_segmentation:
          return (
            <SemanticSegmentation
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case styleTransfer:
          return (
            <StyleTransferOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case imageTo3D:
          return (
            <ImageTo3DOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case textToText:
          return (
            <TextOutput
              onBackClicked={props.onBackClicked}
              onSubmit={props.runTrial}
              trial={props.trialOutput}
            />
          );
        case textToCode:
          return (
            <TextToCodeOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case audioToText:
          return (
            <AudioToTextOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case audioDiarization:
          return (
            <AudioDiarizationOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case textConversation:
          return (
            <TextConversationOutput
              trial={props.trialOutput}
              onSubmit={props.runTrial}
            />
          );
        case textGuidedImageToImage:
          return (
            <TextGuidedImageToImageOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case visualQuestionAnswering:
          return (
            <VisualQuestionAnsweringOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case documentQuestionAnswering:
          return (
            <DocumentQuestionAnsweringOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case textToImage:
          return (
            <TextToImageOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case textToVideo:
          return (
            <TextToVideoOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case textToAudio:
          return (
            <TextToAudioOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case textTo3D:
          return (
            <TextTo3DOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case imageToText:
          return (
            <ImageToTextOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );

        case textClassification:
          return (
            <TextClassificationOutput
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}
            />
          );
        case audioClassification:
          return (
            <>
              <InputPreview input={props.trialOutput.inputs[0].src} inputType="audio" onBackClicked={props.onBackClicked} />
              <AudioClassificationOutput
                features={props.features}
                trial={props.trialOutput}
              />
            </>
          );
        case audioToAudio:
          return (
            <AudioToAudioOutput
              features={props.features}
              trial={props.trialOutput}
            />
          );
        case videoClassification:
          return (
            <>
              <InputPreview input={props.trialOutput.inputs[0]} inputType="video" onBackClicked={props.onBackClicked} />
              <VideoClassificationOutput
                features={props.features}
                trial={props.trialOutput}
              />
            </>
          );
        case tableEditing:
          return (
            <TableEditingOutput 
              onBackClicked={props.onBackClicked}
              trial={props.trialOutput}              
            />
          )
        default:
          return (
            <>
              {preview}
              <PendingOutput unsupportedModel />
            </>
          );
      }
    } else {
      return (
        <>
          {preview}
          <PendingOutput outputType={props.outputType} />
        </>
      );
    }
  };

  return (
    <InteractiveExplanationProvider
      artifacts={interactiveArtifacts}
    >
      <div className={getBlock()}>
      <div className={getElement("header")}>
        {!props.hideHeader && (
          <h2 className={getElement("title")}>Try This Model</h2>
        )}
        {/* <button className={element('share-button')}>Share with community</button> Hidden for now */}
      </div>
      <TextSelectionExplanation
        model={{
          name: props.trialOutput?.model?.name,
          task: props.trialOutput?.model?.output?.type,
          framework: props.trialOutput?.model?.framework?.name,
          frameworkVersion: props.trialOutput?.model?.framework?.version
        }}
        resultContext={{ predictions: topPredictions }}
      >
        <div className={getElement("content")} data-explanation-section="Model result">{makeOutput()}</div>
        {showExplanation && (
          <div className={getElement("explanation")} data-explanation-section="Model explanation">
            {explanationPanel}
          </div>
        )}
      </TextSelectionExplanation>
      <InteractiveExplanationPanel />
      <div className={getElement("footer")}>
        {props.showLearnMoreLink && (
          <a
            href={`/model/${props.trialOutput?.model?.id}`}
            className={getElement("compare-button")}
            onClick={props.compare}
          >
            Learn more about this model
          </a>
        )}
        {!props.showLearnMoreLink && (
          <button
            className={getElement("compare-button")}
            onClick={props.compare}
          >
            Compare with other models
          </button>
        )}
      </div>
      </div>
    </InteractiveExplanationProvider>
  );
}

export function makeTokenDecisionArtifacts(trial, explanation) {
  if (explanation?.status !== "complete") return [];

  const tokens = explanation.tokens || [];
  const preprocess = explanation.pipeline?.preprocess || {};
  const promptInput = trial.inputs?.[0];
  const prompt = typeof promptInput === "string" ? promptInput : promptInput?.src;
  const tokenizer = compactObject({
    name: preprocess.tokenizer,
    promptTokenCount: Array.isArray(preprocess.tokens) ? preprocess.tokens.length : undefined,
    vocabularySize: preprocess.tensor?.vocabularySize
  });
  const model = compactObject({
    name: trial.model?.name,
    task: trial.model?.output?.type,
    framework: trial.model?.framework?.name,
    frameworkVersion: trial.model?.framework?.version
  });

  return tokens.map((token, tokenIndex) => {
    const alternatives = (token.alternatives || []).slice(0, 5).map((alternative) =>
      compactObject({
        token: alternative.token,
        tokenId: alternative.id,
        probability: alternative.probability,
        rank: alternative.rank,
        logit: alternative.logit,
        logits: alternative.logits
      })
    );
    const structuredData = compactObject({
      alternatives,
      tokenizer: Object.keys(tokenizer).length > 0 ? tokenizer : undefined
    });

    return {
      id: `token-decision-${token.position ?? tokenIndex}-${token.id ?? "unknown"}`,
      label: "Generated token decision",
      kind: "token_decision",
      selection: compactObject({
        token: token.token,
        tokenId: token.id,
        position: token.position,
        probability: token.probability,
        rank: token.rank,
        logit: token.logit,
        logits: token.logits
      }),
      structuredData,
      textContext: compactObject({
        prompt: boundTextContext(prompt),
        generatedPrefix: boundTextContext(
          tokens.slice(0, tokenIndex + 1).map((generatedToken) => generatedToken.token || "").join("")
        )
      }),
      model
    };
  });
}

function boundTextContext(value) {
  if (typeof value !== "string") return undefined;
  if (value.length <= maxTextContextLength) return value;
  return `...${value.slice(-(maxTextContextLength - 3))}`;
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
