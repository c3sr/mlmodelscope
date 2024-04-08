import React, { useEffect, useState, useRef } from "react";
import "../Text/TextOutput.scss";
import "./TextConversationOutputChatContainer.scss";
import useBEMNaming from "../../../../../common/useBEMNaming";
import useTextOutput from "../Text/useTextOutput";
import OutputDuration from "../_Common/components/OutputDuration";
import { textConversation } from "../../../../../helpers/TaskIDs";
import Task from "../../../../../helpers/Task";

import conversationHistory from "./conversationHistory";


export default function TextConversationOutput(props) {

    const { getBlock, getElement } = useBEMNaming("text-conversation-output");
    const { inferenceDuration, output, input, setInput, setInferenceDuration } = useTextOutput(
        props.trial
    );

    const { getConversationHistory, updateConversationHistory } = conversationHistory();
    // console.log('conversation history:', getConversationHistory())
    updateConversationHistory('user', input)
    // console.log('conversation history:', getConversationHistory())
    updateConversationHistory('user', output)
    // console.log('conversation history:', getConversationHistory())

    const task = Task.getStaticTask(textConversation);

    const [ message, setMessage ] = useState(null);

    const [ conversation, setConversation ] = useState([
        { role: 'user', content: input }, 
        { role: 'bot', content: output }
    ]);

    const inputField = useRef(null);
    const chatEnd = useRef(null);

    useEffect(() => {
        if (message) {
            updateConversation(message)
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
        console.log('updateConversation: ', conversation);
    }    

    const onSubmit = () => {
        console.log('submit and return bot message....')
        // TODO: Uncomment below?
        // props.onSubmit(input);

        // TODO: Need to send the message to the API, wait for response, 
        // then send it back down to TextConversationChatContainer
        
        // updateConversation({ role: 'bot', content: 'Nope' })
        setMessage({ role: 'bot', content: 'Nope' })
    };


    const [newInput, setNewInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const sendMessage = () => {
        console.log("send user message");
        // console.log('current convo: ', conversation)

        setMessage({ role: 'user', content: newInput });

        updateConversationHistory('user', newInput)
        console.log('conversation history:', getConversationHistory())

        setIsSending(true);
        setNewInput('');
        
        setTimeout(() => {
            onSubmit();
            setIsSending(false);
            setInferenceDuration('2.1s')
        }, 2000);
        
    }    


  return (
    <div className={getBlock()}>
      {/* <TextOutputInputSection
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
      /> */}

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

        {/* <Rating /> */}
      </div>
    </div>
  );
}
