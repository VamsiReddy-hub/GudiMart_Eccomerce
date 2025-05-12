import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getChatHistory, sendChatMessage } from "@/lib/openai";
import { ChatMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch chat history on component mount
  useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        try {
          setIsLoading(true);
          const history = await getChatHistory(userId);
          
          // If no history, add a welcome message
          if (history.length === 0) {
            const botMessage: ChatMessage = {
              id: 0,
              userId,
              isBot: true,
              message: "Hi there! I'm your AI shopping assistant. How can I help you today?",
              timestamp: new Date()
            };
            setMessages([botMessage]);
          } else {
            setMessages(history);
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchHistory();
    }
  }, [userId, isOpen]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now(),
      userId,
      isBot: false,
      message: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    
    try {
      // Send message to API and get bot response
      const botResponse = await sendChatMessage(userId, newMessage);
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        userId,
        isBot: true,
        message: "Sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl z-40"
        >
          <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="font-medium">AI Shopping Assistant</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close chat"
              className="text-white hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-4 space-y-4" id="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start ${message.isBot ? "" : "justify-end"}`}
              >
                {message.isBot ? (
                  <div className="flex">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-primary text-white rounded-lg p-3 max-w-[90%]">
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary/10 text-dark rounded-lg p-3 max-w-[90%]">
                    <p className="text-sm">{message.message}</p>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
                </Avatar>
                <div className="bg-primary text-white rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:border-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-r disabled:opacity-50"
                disabled={isLoading || !newMessage.trim()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Chatbot;
