import React from 'react';
import MaskGenerationOutput from "./MaskGenerationOutput";
import { TestMaskGenerationOutput } from './testData/testMaskGenerationOutput';
import { TestInstanceSegmentationOutput } from '../InstanceSegmentation/testData/TestFeatures';

export default {
  title: "Experiments/Quick Output/Mask Generation",
  component: MaskGenerationOutput
}

const Template = (args) => <MaskGenerationOutput {...args}/>

export const Default = Template.bind({});

Default.args = {trial: TestMaskGenerationOutput};
// Default.args = {trial: TestInstanceSegmentationOutput};
