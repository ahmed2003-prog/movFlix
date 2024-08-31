import React, { useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import config from './Config';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import 'react-chatbot-kit/build/main.css';
import { MdWidthFull } from 'react-icons/md';

const MovieChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  console.log("Chat is open")

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={styles.chatbotContainer}>
      <button style={styles.toggleButton} onClick={toggleChatbot}>
        <span>{isOpen ? 'Close' : 'Chat'}</span>
      </button>
      {isOpen && (
        <div style={styles.chatbotWrapper}>
          <Chatbot
            config={config}
            actionProvider={ActionProvider}
            messageParser={MessageParser}
          />
        </div>
      )}
    </div>
  );
};

const styles = {
  chatbotContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
  },
  toggleButton: {
    backgroundColor: '#560319',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: '10px',
    height: 'auto',
    cursor: 'pointer',
    width:'60px',
    fontSize: '16px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },
  chatbotWrapper: {
    position: 'relative',
    maxWidth: '400px',
    height: '500px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
  },
};

export default MovieChatbot;
