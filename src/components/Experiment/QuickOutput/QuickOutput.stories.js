import React from 'react';
import QuickOutput from "./QuickOutput";
import TestFeatures, {
  TestImageClassificationResult,
  TestImageClassificationResultNoFeatures
} from "./Outputs/Classification/Features";
import kitty from "../../../stories/assets/kitty-large.jpg";

export default {
  title: 'Experiments/Quick Output/Image Classification',
  component: QuickOutput,
};

const Template = (args) => <QuickOutput {...args} />;

export const Default = Template.bind({});
Default.args = {
  features: TestFeatures,
  input: kitty,
  trialOutput: TestImageClassificationResult
}

export const NoPredictions = Template.bind({});

NoPredictions.args = {
  features: [],
  input: kitty,
  trialOutput: TestImageClassificationResultNoFeatures
}


export const ProcessFailed = Template.bind({});

ProcessFailed.args = {
  features: [],
  input: kitty,
  processFailed: true
}
