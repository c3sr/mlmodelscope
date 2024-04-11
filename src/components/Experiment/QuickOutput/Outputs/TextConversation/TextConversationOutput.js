import React, { useEffect, useState, useRef } from "react";
import "../Text/TextOutput.scss";
import "./TextConversationOutputChatContainer.scss";
import useBEMNaming from "../../../../../common/useBEMNaming";
import useTextOutput from "../Text/useTextOutput";
import OutputDuration from "../_Common/components/OutputDuration";
import { textConversation } from "../../../../../helpers/TaskIDs";
import Task from "../../../../../helpers/Task";

import conversationHistory from "./conversationHistory";
import Rating from "../Classification/Rating";


export default function TextConversationOutput(props) {

    const { getBlock, getElement } = useBEMNaming("text-conversation-output");
    const { inferenceDuration, output, input, setInput, setInferenceDuration } = useTextOutput(
        props.trial
    );

    const { getConversationHistory, updateConversationHistory } = conversationHistory();
    const convo = [];
    updateConversationHistory('user', input)
    updateConversationHistory('assistant', output)
    // console.log('conversation history:', getConversationHistory())

    const task = Task.getStaticTask(textConversation);

    const [ message, setMessage ] = useState(null);

    const [ conversation, setConversation ] = useState(getConversationHistory());

    const inputField = useRef(null);
    const chatEnd = useRef(null);

    useEffect(() => {
        if (message) {
            updateConversation(message);
        }
    }, [message])

    useEffect(() => {
        if (conversation) {
            chatEnd.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [conversation]);

    useEffect(() => {
        if (!isSending) {
            // NOTE: Currently not working
            if (inputField.current) {
                console.log('focus on input field')
                inputField.current.focus();
            }

        }
    }, [isSending]);
    
    const updateConversation = (message) => {
        setConversation([...conversation, message]);
        // console.log('updateConversation: ', conversation);
    }    

    const onSubmit = async () => {
        console.log('submit and return bot message....')
        // TODO: Need to send the message to the API, wait for response, 
        // then send it back down to TextConversationChatContainer
        
        // Submit to API
        const convo = getConversationHistory();
        const trialResponse = await props.onSubmit(newInput, convo);
        // console.log(trialResponse);

        const newOutput = trialResponse?.results?.responses[0]?.features[0]?.text ?? "Something went wrong.";
        // console.log(newOutput)

        setMessage({ role: 'assistant', content: newOutput });
        updateConversationHistory('assistant', newOutput);
        console.log('conversation history:', getConversationHistory())

        const newInferenceDuration = trialResponse?.results?.duration_for_inference ?? "0s";
        // console.log(newInferenceDuration)
        setInferenceDuration(newInferenceDuration);

        setIsSending(false);

        console.log('this should be the last message...', conversation)
    };


    const [newInput, setNewInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const sendMessage = async () => {
        console.log("send user message");
        // console.log('current convo: ', conversation)

        setMessage({ role: 'user', content: newInput });

        updateConversationHistory('user', newInput);
        console.log('conversation history:', getConversationHistory())

        setIsSending(true);

        // TODO: Uncomment, this is when we want to actually submit
        // await onSubmit();
        
        // This is temporary, using as a mock response + delay
        setTimeout(() => {
            onSubmit();
        }, 2000);        

        setNewInput('');
    }    


  return (
    <div className={getBlock()}>
      <div className={getElement("results")}>
        <div className={getElement("title-row")}>
          <h3 className={getElement("title-row-title")}>Output</h3>
          <OutputDuration duration={inferenceDuration} />
        </div>
        <p className={getElement("subtitle")}>
            {task.outputText}
        </p>
        <div className={getElement("output-container")}>
            <div className={getElement("chat-container")}>  
                {
                    conversation.map((message, index) => {
                        return (
                            <div 
                                key={index}
                                className={getElement(`chat-${message.role}-message`)}
                            >
                                { message.role === "assistant" && (
                                    <div className="assistant-icon-container">
                                        <div className="assistant-icon">
                                            ML
                                        </div>
                                    </div>

                                )}
                                <div className="speech-bubble">
                                    {message.content}
                                </div>
                            </div>
                        )
                    })
                }
                <div ref={chatEnd} />         
            </div>  
            
        </div>
        <div className={getElement("chat-input-container")}>
            <textarea
                useref={inputField}
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                className={getElement("input-container-text")}
                autoFocus
            ></textarea>

            <div className={getElement("input-submit-row")}>
                <button
                    onClick={sendMessage}
                    className={getElement("input-submit-button")}
                    disabled={isSending}
                >
                    { (!isSending) ?
                        (
                            <span className={getElement("input-submit-button-content")}>
                                Send
                            </span>
                        ) : (
                            <span className={getElement("input-submit-button-content")}>
                                <div className={getElement('spinner-container')}>
                                    <div className={getElement('spinner')}></div>
                                </div>    
                            </span>
                        )
                    }
                </button>
            </div>
        </div>        

        <Rating />
      </div>
    </div>
  );
}
