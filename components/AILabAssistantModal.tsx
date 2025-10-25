import React, { useState, useRef, useEffect } from 'react';
import { Component } from '../types.ts';
import { askAILabAssistant } from '../services/geminiService.ts';
import { AIAssistantIcon, SendIcon } from './Icons.tsx';

interface AILabAssistantModalProps {
  onClose: () => void;
  components: Component[];
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AILabAssistantModal: React.FC<AILabAssistantModalProps> = ({ onClose, components }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm your TinkerHub AI Assistant. Ask me anything about your inventory or for project ideas!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const inventoryContext = JSON.stringify(components.map(({ name, category, totalQuantity, issuedTo }) => ({
        name,
        category,
        totalQuantity,
        availableQuantity: totalQuantity - issuedTo.length,
        issuedTo: issuedTo.map(i => i.studentName),
      })));
      
      const aiResponseText = await askAILabAssistant(input, inventoryContext);
      
      const aiMessage: Message = { sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      const errorMessage: Message = { sender: 'ai', text: `Sorry, I ran into an error: ${error.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-4 p-4 border-b border-slate-700">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full text-white">
                <AIAssistantIcon />
            </div>
            <div>
                <h2 className="text-xl font-bold text-sky-400">AI Lab Assistant</h2>
                <p className="text-sm text-slate-400">Your smart inventory helper</p>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        </header>

        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 bg-slate-700 rounded-full flex-shrink-0"></div>}
              <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex-shrink-0"></div>
              <div className="max-w-md p-3 rounded-lg bg-slate-700 text-slate-200">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask 'How many Arduinos are available?'"
                    className="flex-grow bg-transparent text-white placeholder-slate-500 focus:outline-none px-2"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default AILabAssistantModal;
