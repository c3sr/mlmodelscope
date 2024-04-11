import React, {useMemo} from "react";
import TextConversationOutput from "./TextConversationOutput";
import { TestTextConversationOutput, TestTextConversationOutput2 } from "./testData/testTextConversationOutput";
import { DefaultTextConversationModel } from "../../../../../helpers/DefaultModels";
import GetApiHelper from "../../../../../helpers/api";


export default {
  title: "Experiments/Quick Output/Text Conversation",
  component: TextConversationOutput,
};

const template = (args) => <TextConversationOutput {...args} />;

const onSubmit = async (input, context) => {
    // Note: context param should contain the conversation history,
    // to be sent to the api
    
    console.log('test onSubmit')  // Delete this

    // This is basically what "should" happen, uncomment to confirm in Storybook
    // see what values would be sent to the api
    const api = GetApiHelper(); 
    await api.runTrial(DefaultTextConversationModel, input, null, context);

    // Dummy response instead of actually calling api.runTrial above
    return TestTextConversationOutput2;
}

export const Default = template.bind({});
Default.args = { trial: TestTextConversationOutput, onSubmit: onSubmit};

// export const FollowUpResponse = template.bind({});
// FollowUpResponse.args = { trial: TestTextConversationOutput2 }
