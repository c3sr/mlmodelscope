import { useState } from "react";

export const getInitialConversation = (trial) => {
    console.log('getChatHistory')
    console.log('trial', trial)
  
    return trial?.results?.responses;
}

// Delete this file