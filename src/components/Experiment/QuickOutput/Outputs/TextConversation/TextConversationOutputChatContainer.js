import React, { useState } from "react";
import useBEMNaming from "../../../../../common/useBEMNaming";

import "./TextConversationOutputChatContainer.scss";

export default function TextConversationChatContainer(props) {
    const input = props.input;
    const output = props.output;
    // const conversation = props.conversation;
    const updateConversation = props.updateConversation;

    // const [ conversation, setConversation ] = useState([
    //     { 'sender': 'user', 'text': input }, 
    //     { 'sender': 'bot', 'text': output }
    // ]);
    
    // const updateConversation = (message) => {
    //     setConversation([...conversation, message]);        
    // }


    // console.log('conversation', conversation);    
    
    // const updateConversation = props.updateConversation;
    // console.log(props)


    const [newInput, setNewInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const { getElement } = useBEMNaming("text-conversation-output");

    const sendMessage = () => {
        console.log("send user message")
        // updateConversation(newInput);
        console.log('before: ', props.conversation)
        updateConversation({ 'sender': 'user', 'text': newInput });
        console.log('after: ', props.conversation)


        setIsSending(true);
        setNewInput('');
        
        setTimeout(() => {
            // TODO: Why is this replacing the most recent message
            props.onSubmit();
            setIsSending(false)
        }, 2000)
        // props.onSubmit();
    }

    // console.log(isSending)

    return (
        <div className={getElement("chat-container")}>
            {/* <div className={getElement("chat-input-message")}>
                <div className="speech-bubble">
                    {input}
                </div>
            </div>
            <div className={getElement("chat-output-message")}>
                <div className="speech-bubble">
                    {output}
                </div>
            </div> */}

            {
                props.conversation.map((message, index) => {
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
        

            <div className={getElement("chat-input-container")}>
                <textarea
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
        </div>
    )
}
