import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../components/AuthProvider';
import apiClient, { UPLOADS_URL } from '../utils/api';

function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI Veterinary Assistant. I can help answer medical questions about your dogs and cats. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Initialize based on screen width
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [error, setError] = useState(null);
  const [userPets, setUserPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = [
    "My dog ate chocolate, what do I do?",
    "How can I tell if my cat is sick?",
    "Why is my dog scratching so much?",
    "Vaccination schedule for puppies"
  ];

  // Fetch user pets for context selector
  useEffect(() => {
    // Wait for user to be populated
    if (user && user.id) {
      apiClient.getUserPets(user.id)
        .then(response => {
          if (response.success) {
            // Check for various response structures:
            // 1. response.data.pets (typical)
            // 2. response.data.items (paginated)
            // 3. response.pets (legacy)
            // 4. response.data (direct array)
            let petsData = response.data?.pets || response.data?.items || response.pets || response.data || [];

            // Double check if we got a pagination object wrapper that wasn't caught
            if (!Array.isArray(petsData) && petsData.items && Array.isArray(petsData.items)) {
              petsData = petsData.items;
            }

            if (Array.isArray(petsData)) {
              setUserPets(petsData);
            } else {
              console.warn('Unexpected pets data format:', petsData);
              setUserPets([]);
            }
          }
        })
        .catch(err => console.error('Error loading pets:', err));
    }
  }, [user]); // Re-run when user object changes

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input after sending message
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Handle new chat - clear messages
  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: "Hello! I'm your AI Veterinary Assistant. I can help answer medical questions about your dogs and cats. How can I help you today?",
        timestamp: new Date()
      }
    ]);
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Send message to backend
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    // Add user message to chat
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Prepare messages for API (only role and content)
      const apiMessages = updatedMessages.map(({ role, content }) => ({ role, content }));

      // Call backend API with selected pet context
      const response = await apiClient.sendChatMessage(apiMessages, selectedPetId || null);

      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(response.message || 'Failed to get response from AI');
        // Add error message to chat
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I'm sorry, I encountered an issue processing your request. Please try again.",
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError('Network error. Please check your connection and try again.');
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet connection and try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-interface">
      {/* Mobile Overlay Backdrop */}
      <div
        className={`chat-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`chat-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {sidebarOpen && <span>Chat</span>}
          </h3>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarOpen ? (
                <polyline points="11 17 6 12 11 7" />
              ) : (
                <polyline points="9 18 15 12 9 6" />
              )}
            </svg>
          </button>
        </div>

        {sidebarOpen && (
          <>
            {/* New Chat Button */}
            <button className="btn btn-primary new-chat-btn" onClick={handleNewChat}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Chat
            </button>

            {/* User Info */}
            <div className="sidebar-section">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="sidebar-section-title m-0">Context</h4>
                <p className="text-muted text-xs m-0">Select a pet to discuss</p>
              </div>
              <div className="pet-selector">
                <select
                  id="pet-select"
                  className="form-select pet-select"
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  aria-label="Select Pet Context"
                >
                  <option value="">General (No specific pet)</option>
                  {userPets.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name || pet.s_petname} ({pet.type || pet.s_type})
                    </option>
                  ))}
                </select>
                {selectedPetId && (
                  <small className="text-muted" style={{ display: 'block', marginTop: '5px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    Discussing: {(() => {
                      const pet = userPets.find(p => String(p.id) === selectedPetId);
                      return pet ? (pet.name || pet.s_petname) : '';
                    })()}
                  </small>
                )}
              </div>
            </div>

            <div className="sidebar-user-info">
              <div className="user-avatar-small">
                {user?.avatar ? (
                  <img
                    src={user.avatar.startsWith('/') ? user.avatar : `${UPLOADS_URL}/uploads/users/${user.avatar}`}
                    alt={user.username}
                    onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(user?.username || user?.fullName || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.fullName || user?.username || 'User'}</span>
                <span className="user-email">{user?.email || ''}</span>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
              <p className="sidebar-disclaimer">
                AI responses are for informational purposes only.
              </p>
            </div>
          </>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <div>
              <h2 className="chat-title">GoodPawies AI Assistant</h2>
              <span className="chat-status">
                <span className={`status-dot ${isLoading ? 'typing' : ''}`}></span>
                {isLoading ? 'Typing...' : 'Online - Ready to help'}
              </span>
            </div>
          </div>
          <button
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'} ${message.isError ? 'message-error' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="message-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </div>
              )}
              <div className="message-content">
                {message.role === 'assistant' && !message.isError ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  <p>{message.content}</p>
                )}
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
              {message.role === 'user' && (
                <div className="message-avatar user-avatar-small">
                  {user?.avatar ? (
                    <img
                      src={user.avatar.startsWith('/') ? user.avatar : `${UPLOADS_URL}/uploads/users/${user.avatar}`}
                      alt="You"
                      onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                    />
                  ) : (
                    <span>{(user?.username || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
              )}
            </div>
          ))}

          {messages.length === 1 && (
            <div className="chat-suggestions">
              <p className="suggestions-label">Suggested questions:</p>
              <div className="suggestions-grid">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-chip"
                    onClick={() => {
                      setInputValue(suggestion);
                      // Optional: auto-send
                      // handleSendMessage({ preventDefault: () => {} }); // tricky with state updates so just set input
                      if (inputRef.current) inputRef.current.focus();
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="message message-assistant">
              <div className="message-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <div className="message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="chat-error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="error-dismiss">×</button>
          </div>
        )}

        {/* Input Area */}
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Describe your pet's symptoms or ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn chat-send-btn"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="send-loading"></div>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          <p className="chat-disclaimer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            AI advice is for informational purposes only and does not replace a real veterinarian.
          </p>
        </form>
      </main>
    </div>
  );
}

export default ChatPage;
