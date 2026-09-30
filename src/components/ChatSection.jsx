import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, MessageSquare, Bot, User, Sparkles, RefreshCw, Copy, Check, HelpCircle } from 'lucide-react';
import { callGeminiAPI, generateSuggestedQuestions } from '../services/geminiService';

export const ChatSection = ({ document, currentModel, hasKey }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Load suggested questions when a new document is supplied
  useEffect(() => {
    if (document) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi! I'm ready to answer any questions about **${document.fileName}**. What would you like to know?`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      if (hasKey) {
        setLoadingSuggestions(true);
        generateSuggestedQuestions(document, null, currentModel)
          .then(qs => setSuggestedQuestions(qs))
          .catch(() => setSuggestedQuestions([
            `What are the main takeaways in ${document.fileName}?`,
            `Are there any critical dates or deadlines mentioned?`,
            `Can you summarize section by section?`
          ]))
          .finally(() => setLoadingSuggestions(false));
      }
    }
  }, [document, currentModel, hasKey]);

  const handleSend = async (questionText) => {
    const textToSend = questionText || input;
    if (!textToSend || !textToSend.trim() || isSending || !document) return;

    const userMessage = {
      id: Date.now() + '-user',
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const historyForApi = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const replyText = await callGeminiAPI({
        prompt: textToSend.trim(),
        document,
        model: currentModel,
        chatHistory: historyForApi
      });

      const botMessage = {
        id: Date.now() + '-bot',
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: Date.now() + '-err',
        role: 'assistant',
        content: `⚠️ **Error generating response**: ${err.message}`,
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-title">
          <MessageSquare size={18} className="chat-header-icon" />
          <span>Document Chat & Q&A Workspace</span>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="clear-chat-btn"
          title="Reset chat transcript"
        >
          <RefreshCw size={14} /> Clear History
        </button>
      </div>

      {/* Suggested Questions Bar */}
      {suggestedQuestions.length > 0 && (
        <div className="suggested-questions-bar">
          <div className="suggested-label">
            <HelpCircle size={14} />
            <span>Suggested Questions:</span>
          </div>
          <div className="suggested-pills">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isSending}
                className="question-pill"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={msg.id || index} className={`chat-bubble-row ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`bubble-content ${msg.isError ? 'error' : ''}`}>
              <div className="bubble-text markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>

              <div className="bubble-meta">
                <span className="timestamp">{msg.timestamp}</span>
                {msg.role === 'assistant' && !msg.isError && (
                  <button
                    onClick={() => handleCopyMessage(msg.content, index)}
                    className="bubble-copy-btn"
                    title="Copy text"
                  >
                    {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="chat-bubble-row assistant thinking">
            <div className="avatar">
              <Bot size={16} />
            </div>
            <div className="bubble-content">
              <div className="thinking-dots">
                <Sparkles size={14} className="spin-sparkle" />
                <span>Gemini is reading document & drafting answer...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="chat-input-form"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask a question about ${document.fileName}...`}
          className="chat-input"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="chat-send-btn"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
