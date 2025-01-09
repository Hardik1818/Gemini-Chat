import { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Send message to API and display response
  const sendMessage = async (message) => {
    if (!message.trim()) return; // Avoid empty messages

    // Add user's message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, sender: 'user' },
    ]);
    setNewMessage('');
    await generateAnswers(message); // Get response from API
  };

  // Call Gemini API to generate a response
  const generateAnswers = async (userMessage) => {

    try {
      setLoading(true);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_API_URL}`,
        {
          contents: [{ parts: [{ text: userMessage }] }],
        }
      );

      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates[0]?.content?.parts[0]?.text
      ) {
        const generatedAnswer = response.data.candidates[0].content.parts[0].text;

        setMessages((prevMessages) => [
          ...prevMessages,
          { text: generatedAnswer, sender: 'ai' },
        ]);
      } 
    } catch (error) {
      console.error('Error generating answer:', error);
      alert('Something went wrong while fetching the response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage(newMessage);
    }
  };

  // Scroll to the bottom whenever the messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Gemmy Chat</h1>
      </header>

      <main className="chat-container">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === 'user' ? 'user' : 'ai'}`}
            >
              {message.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="input-box"
            placeholder="Type a message..."
          />
          <button
            onClick={() => sendMessage(newMessage)}
            className="send-button"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Send'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
