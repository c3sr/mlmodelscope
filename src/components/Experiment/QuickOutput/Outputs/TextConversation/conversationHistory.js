import { useState } from "react";

export default function conversationHistory() {
//   const [conversation, setConversation] = useState([]);
  let conversation = [];

  const getConversationHistory = () => {
    return conversation;
  }

  const setConversationHistory = (role, content) => {
    conversation.push({role: role, content: content});
    // console.log(conversation);
    return conversation;
  }

  const updateConversationHistory = (role, content) => {
    setConversationHistory(role, content);
    return conversation;
  }



  return {
    getConversationHistory,
    updateConversationHistory
  };
}