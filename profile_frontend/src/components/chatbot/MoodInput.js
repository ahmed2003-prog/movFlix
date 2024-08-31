import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  botName: 'MovieBot',
  initialMessages: [createChatBotMessage("Hi! I'm MovieBot. How are you feeling today?")],
  customComponents: {
    header: () => <div style={{ backgroundColor: '#e74c3c', padding: '5px', color: '#fff', borderRadius: '5px' }}>MovieBot</div>,
    botMessageBox: () => <div style={{ backgroundColor: '#e74c3c', padding: '10px', borderRadius: '10px', color: '#fff' }} />,
    userMessageBox: () => <div style={{ backgroundColor: '#2ecc71', padding: '10px', borderRadius: '10px', color: '#fff' }} />,
  },
  customStyles: {
    botMessageBox: {
      backgroundColor: '#242124',
    },
    chatButton: {
      backgroundColor: '#242124',
    },
  },
};

export default config;
