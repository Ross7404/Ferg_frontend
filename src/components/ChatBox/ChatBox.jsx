import React, { useState, useEffect, useRef } from 'react';
import { IoMdSend } from 'react-icons/io';
import { FaUser } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { GiHoneycomb } from 'react-icons/gi';
import axios from 'axios';
import botChat from './chatbot.png';
import { BiExpand, BiCollapse } from 'react-icons/bi';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [logoSize, setLogoSize] = useState('medium');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const API_URL = 'http://localhost:3000/v1/api/chatbot/chat';
  const [userId] = useState(1); // Tạm thời hardcode userId = 1

  // Tải tin nhắn từ localStorage khi component mount
  useEffect(() => {
    const savedData = localStorage.getItem('chatMessages');
    if (savedData) {
      try {
        const { messages, timestamp } = JSON.parse(savedData);
        const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // 1 tuần tính bằng mili giây
        const currentTime = new Date().getTime();
        
        // Kiểm tra xem dữ liệu có cũ hơn 1 tuần không
        if (timestamp && currentTime - timestamp < oneWeekInMs) {
          setMessages(messages);
        } else {
          // Nếu dữ liệu cũ hơn 1 tuần, xóa khỏi localStorage
          localStorage.removeItem('chatMessages');
        }
      } catch (error) {
        console.error('Error parsing saved messages:', error);
        localStorage.removeItem('chatMessages');
      }
    }
  }, []);
  
  // Lưu tin nhắn vào localStorage khi messages thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      const dataToSave = {
        messages,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('chatMessages', JSON.stringify(dataToSave));
    }
  }, [messages]);

  // Hàm xử lý thay đổi kích thước
  const toggleLogoSize = (e) => {
    e.stopPropagation();
    setLogoSize(prevSize => {
      switch(prevSize) {
        case 'small': return 'medium';
        case 'medium': return 'large';
        case 'large': return 'small';
        default: return 'medium';
      }
    });
  };

  // Nhận kích thước thực tế dựa vào state logoSize
  const getLogoSizeClass = () => {
    switch(logoSize) {
      case 'small': return 'w-[60px] h-[60px]';
      case 'medium': return 'w-[90px] h-[90px]';
      case 'large': return 'w-[120px] h-[120px]';
      default: return 'w-[90px] h-[90px]';
    }
  };

  // Focus input khi mở chatbox
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
    
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }
  }, [isOpen]);

  // Tự động cuộn đến tin nhắn mới nhất
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hiệu ứng click outside để đóng chatbox
  useEffect(() => {
    function handleClickOutside(event) {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userInputText = inputMessage;
    
    const userMessage = {
      text: userInputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');
    setIsTyping(true);

    try {
      const response = await axios.post(API_URL, {
        message: userInputText,
        conversation: messages
      });

      const aiResponse = response.data.response;
      setIsTyping(false);

      setTimeout(() => {
        const aiMessage = {
          id: Date.now().toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date().toISOString()
        };

        setMessages(prevMessages => [...prevMessages, aiMessage]);
      }, 500);
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      setIsTyping(false);
      setError(error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi xử lý yêu cầu');
      
      const errorMessage = {
        id: Date.now().toString(),
        text: `Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. ${error.response?.data?.message || error.message || 'Vui lòng thử lại sau.'}`,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Xóa lịch sử chat
  const clearChat = async () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  // Định dạng text (chuyển URL thành links và xuống dòng)
  const formatMessage = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const textWithLinks = text.replace(urlRegex, url => 
      `<a href="${url}" target="_blank" class="text-blue-600 hover:underline">${url}</a>`
    );
    return textWithLinks.replace(/\n/g, '<br />');
  };

  const handleOpenChat = () => {
    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat icon */}
      {!isOpen && (
        <div className="relative">
          <button
            onClick={handleOpenChat}
            className="relative border-none rounded-full bg-transparent cursor-pointer flex items-center justify-center hover:scale-105"
            aria-label="Open Movie Assistant chat"
          >
            <img 
              src={botChat}
              alt="Movie Assistant" 
              className={`${getLogoSizeClass()} object-contain filter drop-shadow-lg transition-all duration-300 transform-gpu animate-[float_3s_ease-in-out_infinite]`}
            />
          </button>
          
          {/* Size adjustment button */}
          <button 
            onClick={toggleLogoSize}
            className="absolute top-0 right-0 w-8 h-8 bg-[var(--accent-color)] hover:bg-[var(--accent-color)] rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 text-white border-2 border-white"
            title={logoSize === 'large' ? "Shrink logo" : "Enlarge logo"}
            aria-label={logoSize === 'large' ? "Shrink logo" : "Enlarge logo"}
          >
            {logoSize === 'large' ? <BiCollapse className="text-lg" /> : <BiExpand className="text-lg" />}
          </button>
        </div>
      )}

      {/* Chat box */}
      {isOpen && (
        <div 
          ref={chatBoxRef}
          className={`w-[360px] h-[500px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden relative transition-all duration-300 border-2 border-[var(--accent-color)] ${isAnimating ? 'animate-[scaleIn_0.3s_ease-out]' : ''}`}
        >
          {/* Header */}
          <div className="bg-[var(--accent-color)] text-white py-3 px-4 flex justify-between items-center rounded-t-2xl shadow-sm">
            <div className="flex items-center">
              <img 
                src={botChat}
                alt="Movie Assistant" 
                className="w-6 h-6 mr-2"
              />
              <h3 className="font-medium">Box chat Movie Assistant</h3>
            </div>
            <div className="flex items-center">
              <button 
                onClick={clearChat}
                className="text-white hover:text-gray-200 mr-3"
                title="Clear chat history"
                aria-label="Clear chat history"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
                aria-label="Close chat"
              >
                <IoClose className="text-xl" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 bg-[radial-gradient(#ffeeba_2px,transparent_2px),radial-gradient(#ffeeba_2px,transparent_2px)] bg-[length:40px_40px] bg-[position:0_0,20px_20px] scroll-smooth">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-5 text-center animate-[fadeIn_0.5s_ease-out]">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Hello, I'm your Movie Assistant!</h3>
                <p className="text-gray-600 mb-5">I can help you find movies, book tickets, and get information about theaters.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <button onClick={() => setInputMessage("What movies are currently showing?")} className="bg-white border border-[var(--accent-color)] text-gray-800 py-2 px-3 rounded-full text-sm cursor-pointer transition-all duration-200 hover:bg-amber-50 hover:-translate-y-0.5 hover:shadow-sm">🎬 Now Showing</button>
                  <button onClick={() => setInputMessage("How do I book movie tickets?")} className="bg-white border border-[var(--accent-color)] text-gray-800 py-2 px-3 rounded-full text-sm cursor-pointer transition-all duration-200 hover:bg-amber-50 hover:-translate-y-0.5 hover:shadow-sm">🎟️ Booking Guide</button>
                  <button onClick={() => setInputMessage("Show me theaters nearby")} className="bg-white border border-[var(--accent-color)] text-gray-800 py-2 px-3 rounded-full text-sm cursor-pointer transition-all duration-200 hover:bg-amber-50 hover:-translate-y-0.5 hover:shadow-sm">🏢 Nearby Theaters</button>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-2.5 rounded-2xl relative ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-amber-300 to-amber-400 text-gray-800 rounded-tr-sm' 
                      : 'bg-white text-gray-800 border border-amber-200/30 rounded-tl-sm shadow-sm'
                  }`}>
                    <div className="flex items-center mb-1 text-xs">
                      {message.sender === 'user' ? (
                        <span className="flex items-center">
                          <span className="mx-1 text-black/50">{formatTimestamp(message.timestamp)}</span>
                          <FaUser className="text-[10px] text-gray-700" />
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <img 
                            src={botChat}
                            alt="Movie Assistant" 
                            className="w-4 h-4 object-contain mr-1" 
                          />
                          <span className="mx-1 text-black/50">{formatTimestamp(message.timestamp)}</span>
                        </span>
                      )}
                    </div>
                    {message.sender === 'user' ? (
                      <p className="leading-relaxed break-words">{message.text}</p>
                    ) : (
                      <div 
                        className="leading-relaxed break-words" 
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }} 
                      />
                    )}
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="mb-4 flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm border border-amber-200/30 shadow-sm p-2 max-w-[80%]">
                  <div className="flex items-center gap-[5px] py-2">
                    <span className="h-2 w-2 float-left m-0 bg-amber-400 rounded-full opacity-40 animate-[typing_1s_infinite]"></span>
                    <span className="h-2 w-2 float-left m-0 bg-amber-400 rounded-full opacity-40 animate-[typing_1s_0.2s_infinite]"></span>
                    <span className="h-2 w-2 float-left m-0 bg-amber-400 rounded-full opacity-40 animate-[typing_1s_0.4s_infinite]"></span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 py-2 px-3 rounded-lg mx-auto my-2.5 text-xs text-center max-w-[90%]">{error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[var(--accent-color)] bg-white">
            <div className="flex relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about movies..."
                className="flex-1 border-2 border-[var(--accent-color)] rounded-xl py-2.5 px-3 resize-none text-sm bg-white transition-all focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-amber-200/20"
                rows="2"
                aria-label="Type your message"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || inputMessage.trim() === ''}
                className={`w-[42px] min-w-[42px] h-[42px] ml-2 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 self-end ${
                  isLoading || inputMessage.trim() === '' 
                    ? 'opacity-60 cursor-not-allowed bg-gray-300'
                    : 'bg-[var(--accent-color)] to-amber-500 text-white hover:scale-105 hover:from-amber-500 hover:to-amber-600'
                }`}
                aria-label="Send message"
              >
                <IoMdSend className="text-lg" />
              </button>
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500 text-center">
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox; 