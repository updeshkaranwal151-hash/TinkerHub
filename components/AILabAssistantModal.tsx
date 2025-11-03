

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Component } from '../types.ts';
import { askAILabAssistant } from '../services/geminiService.ts';
import { AIAssistantIcon, SendIcon, PlusIcon, TrashIcon } from './Icons.tsx'; // Import TrashIcon for clearing image

interface AILabAssistantModalProps {
  onClose: () => void;
  components: Component[];
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string; // Optional: to display user's image in chat
}

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};


const AILabAssistantModal: React.FC<AILabAssistantModalProps> = ({ onClose, components }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm your TinkerHub AI Assistant. I can help you with inventory reports, project ideas, and even process images! What can I help you with today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'deep'>('fast');
  const [showSuggestionPrompts, setShowSuggestionPrompts] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const reportPrompts = [
    "What is the most issued component?",
    "Give a monthly breakdown of issues.",
    "Which components are running low on stock?",
    "What's the total quantity of all items?"
  ];

  const creativePrompts = [
    "Suggest a project with available parts.",
    "What can I build with an Arduino?",
  ];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImageFile(file);
      setSelectedImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedImageFile(null);
      setSelectedImagePreview(null);
      if (file) alert('Please select a valid image file (PNG, JPEG, WEBP, GIF).');
    }
  };

  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    // Clear the file input value as well, if it exists
    const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };


  const sendMessage = async (prompt: string, imageFile: File | null = null) => {
    if ((!prompt && !imageFile) || isLoading) return; // Must have either text or image

    let userMessage: Message;
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;

    if (imageFile) {
        imageBase64 = (await fileToBase64(imageFile)).split(',')[1];
        imageMimeType = imageFile.type;
        userMessage = { sender: 'user', text: prompt, imageUrl: URL.createObjectURL(imageFile) };
    } else {
        userMessage = { sender: 'user', text: prompt };
    }
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    clearSelectedImage(); // Clear image input after sending

    try {
      const inventoryContext = JSON.stringify(components.map(({ name, category, totalQuantity, issuedTo, lowStockThreshold }) => ({
        name,
        category,
        totalQuantity,
        availableQuantity: totalQuantity - issuedTo.length,
        issueHistory: issuedTo.map(i => ({ studentName: i.studentName, issuedDate: i.issuedDate })),
        lowStockThreshold: lowStockThreshold ?? null,
      })));
      
      const aiResponseText = await askAILabAssistant(
        prompt, 
        inventoryContext, 
        mode, 
        imageBase64, 
        imageMimeType
      );
      
      const aiMessage: Message = { sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      const errorMessage: Message = { sender: 'ai', text: `Sorry, I ran into an error: ${error.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFromInput = () => {
    const trimmedInput = input.trim();
    if (trimmedInput || selectedImageFile) { // Allow sending with only an image
      sendMessage(trimmedInput, selectedImageFile);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendFromInput();
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
                {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="User provided" className="max-w-full h-auto rounded-md mb-2 object-cover max-h-48" />
                )}
                {/* FIX: Corrected typo 'whiteWhiteSpace' to 'whiteSpace' */}
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
                <button
                    onClick={() => setShowSuggestionPrompts(prev => !prev)}
                    className="px-4 py-2 bg-slate-700/70 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors duration-300"
                    aria-label={showSuggestionPrompts ? 'Hide suggestion prompts' : 'View suggestion prompts'}
                >
                    {showSuggestionPrompts ? 'Hide Suggestion Prompts' : 'View Suggestion Prompts'}
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">Assistant Mode:</span>
                    <button
                        onClick={() => setMode('fast')}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${mode === 'fast' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
                        aria-pressed={mode === 'fast'}
                    >
                        ⚡ Fast
                    </button>
                    <button
                        onClick={() => setMode('deep')}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${mode === 'deep' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
                        aria-pressed={mode === 'deep'}
                    >
                        🧠 Deep Think
                    </button>
                </div>
            </div>

            {showSuggestionPrompts && (
                <>
                    <div className="mb-4">
                        <p className="text-xs text-slate-400 mb-2 font-semibold">📈 Get Advanced Reports</p>
                        <div className="flex flex-wrap gap-2">
                            {reportPrompts.map((prompt, index) => (
                            <button
                                key={`report-${index}`}
                                onClick={() => sendMessage(prompt)}
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-slate-700/70 text-slate-300 text-xs font-medium rounded-full hover:bg-slate-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {prompt}
                            </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <p className="text-xs text-slate-400 mb-2 font-semibold">💡 Get Creative Ideas</p>
                        <div className="flex flex-wrap gap-2">
                            {creativePrompts.map((prompt, index) => (
                            <button
                                key={`creative-${index}`}
                                onClick={() => sendMessage(prompt)}
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-slate-700/70 text-slate-300 text-xs font-medium rounded-full hover:bg-slate-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {prompt}
                            </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
            
            {/* Image Upload and Preview Section */}
            <div className="flex items-center gap-3 mb-3">
                <label 
                    htmlFor="image-upload-input" 
                    className="p-2 bg-slate-700 text-slate-300 rounded-md cursor-pointer hover:bg-slate-600 transition-colors"
                    aria-label="Upload image"
                >
                    {/* FIX: Passed className prop to PlusIcon */}
                    <PlusIcon className="h-5 w-5" />
                    <input 
                        id="image-upload-input"
                        type="file" 
                        accept="image/png, image/jpeg, image/webp, image/gif" 
                        onChange={handleImageChange} 
                        className="sr-only" 
                        disabled={isLoading}
                    />
                </label>
                {selectedImagePreview && (
                    <div className="relative">
                        <img 
                            src={selectedImagePreview} 
                            alt="Selected preview" 
                            className="h-16 w-16 object-cover rounded-md border border-slate-600" 
                        />
                        <button 
                            onClick={clearSelectedImage}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs leading-none"
                            aria-label="Remove selected image"
                        >
                            {/* FIX: Passed className prop to TrashIcon */}
                            <TrashIcon className="h-3 w-3" />
                        </button>
                    </div>
                )}
                <span className="text-sm text-slate-400">
                    {selectedImageFile ? selectedImageFile.name : 'Attach an image (optional)'}
                </span>
            </div>


            <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask 'How many Arduinos are available?'"
                    className="flex-grow bg-transparent text-white placeholder-slate-500 focus:outline-none px-2"
                    disabled={isLoading}
                    aria-label="Your message to AI assistant"
                />
                <button
                    onClick={handleSendFromInput}
                    disabled={isLoading || (!input.trim() && !selectedImageFile)}
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
