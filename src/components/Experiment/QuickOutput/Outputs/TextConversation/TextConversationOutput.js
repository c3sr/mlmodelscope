import React, { useEffect, useState, useRef } from "react";
import "../Text/TextOutput.scss";
import "./TextConversationOutputChatContainer.scss";
import useBEMNaming from "../../../../../common/useBEMNaming";
import useTextOutput from "../Text/useTextOutput";
import OutputDuration from "../_Common/components/OutputDuration";
import TextOutputInputSection from "../Text/TextOutputInputSection";
import { textConversation } from "../../../../../helpers/TaskIDs";
import Task from "../../../../../helpers/Task";
import TextConversationChatContainer from "./TextConversationOutputChatContainer";
import { getInitialConversation } from "./conversationHistory";

// import TextConversationInputContainer from "./TextConversationOutputInputContainer";

export default function TextConversationOutput(props) {

    const { getBlock, getElement } = useBEMNaming("text-conversation-output");
    const { inferenceDuration, output, input, setInput, setInferenceDuration } = useTextOutput(
        props.trial
    );

    const task = Task.getStaticTask(textConversation);

    const [ message, setMessage ] = useState(null);

    const [ conversation, setConversation ] = useState([
        { sender: 'user', text: input }, 
        { sender: 'bot', text: output }
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
        if (!isSending && inputField.current) {
            // NOTE: Currently not working
            console.log('focus on input field')
            inputField.current.focus();
        }
    }, [isSending]);
    
    const updateConversation = (message) => {
        setConversation([...conversation, message]);
    }    

    const onSubmit = () => {
        console.log('submit and return bot message....')
        // TODO: Uncomment below?
        // props.onSubmit(input);

        // TODO: Need to send the message to the API, wait for response, 
        // then send it back down to TextConversationChatContainer
        
        // updateConversation({ sender: 'bot', text: 'Nope' })
        setMessage({ sender: 'bot', text: 'Nope' })
    };


    const [newInput, setNewInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const sendMessage = () => {
        console.log("send user message");
        console.log('current convo: ', conversation)

        setMessage({ sender: 'user', text: newInput });
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
                                className={getElement(`chat-${message.sender}-message`)}
                            >
                                <div className="speech-bubble">
                                    {message.text}
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
                useRef={inputField}
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                className={getElement("input-container-text")}
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
