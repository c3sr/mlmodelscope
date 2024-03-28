import React from "react";
import TextConversationOutput from "./TextConversationOutput";
import { TestTextConversationOutput } from "./testData/testTextConversationOutput";

export default {
  title: "Experiments/Quick Output/Text Conversation",
  component: TextConversationOutput,
};

const template = (args) => <TextConversationOutput {...args} />;

export const Default = template.bind({});
Default.args = { trial: TestTextConversationOutput };
