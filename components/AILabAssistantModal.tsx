import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Component, AISuggestions, Category } from '../types.ts';
import { askAILabAssistant, analyzeAndCountComponents } from '../services/geminiService.ts';
import { AIAssistantIcon, SendIcon, PlusIcon, TrashIcon } from './Icons.tsx';

interface AILabAssistantModalProps {
  onClose: () => void;
  components: Component[];
  initialImageURL?: string | null;
  onAddMultipleComponents: (components: Omit<Component, 'id' | 'createdAt' | 'isUnderMaintenance' | 'maintenanceLog'>[]) => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  analysisResult?: AISuggestions[];
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

const AILabAssistantModal: React.FC<AILabAssistantModalProps> = ({ onClose, components, initialImageURL, onAddMultipleComponents }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm your TinkerHub AI Assistant. I can help you with inventory reports, project ideas, and even process images! What can I help you with today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'deep'>('fast');
  const [showSuggestionPrompts, setShowSuggestionPrompts] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [editableAnalysis, setEditableAnalysis] = useState<AISuggestions[] | null>(null);

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
  
  useEffect(() => {
    if (initialImageURL) {
      const analyzeScannedImage = async () => {
        setIsLoading(true);
        setMessages(prev => [...prev, {
          sender: 'user',
          text: 'Please analyze and count the components in this image.',
          imageUrl: initialImageURL,
        }]);
        setEditableAnalysis(null);

        try {
          const base64 = initialImageURL.split(',')[1];
          const mimeType = initialImageURL.match(/:(.*?);/)?.[1] || 'image/jpeg';
          
          const analysis = await analyzeAndCountComponents(base64, mimeType);

          if (analysis.length === 0) {
              const aiResponse: Message = { sender: 'ai', text: "I couldn't find any recognizable components in the image. Please try again with a clearer picture." };
              setMessages(prev => [...prev, aiResponse]);
          } else {
              const analysisWithImage = analysis.map(item => ({
                ...item,
                imageUrl: initialImageURL,
              }));
              
              const summary = analysisWithImage.map(item => `- ${item.quantity} x ${item.name}`).join('\n');
              const aiResponseText = `I've analyzed the image and found the following:\n${summary}\n\nYou can edit the details below and add them to your inventory.`;
              
              const aiResponse: Message = { sender: 'ai', text: aiResponseText, analysisResult: analysisWithImage };
              setMessages(prev => [...prev, aiResponse]);
              setEditableAnalysis(analysisWithImage);
          }
        } catch (error: any) {
          const errorMessage: Message = { sender: 'ai', text: `Sorry, I couldn't analyze the image: ${error.message}` };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      analyzeScannedImage();
    }
  }, [initialImageURL]);

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
    const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };


  const sendMessage = async (prompt: string, imageFile: File | null = null) => {
    if ((!prompt && !imageFile) || isLoading) return;

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
    setEditableAnalysis(null);
    clearSelectedImage();

    try {
      const inventoryContext = JSON.stringify(components.map(({ name, category, totalQuantity, issuedTo, lowStockThreshold }) => ({
        name,
        category,
        totalQuantity,
        availableQuantity: totalQuantity - (issuedTo || []).reduce((acc, issue) => acc + (issue.quantity || 1), 0),
        issueHistory: (issuedTo || []).map(i => ({ studentName: i.studentName, issuedDate: i.issuedDate, quantity: i.quantity || 1 })),
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
    if (trimmedInput || selectedImageFile) {
      sendMessage(trimmedInput, selectedImageFile);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendFromInput();
    }
  };
  
  const handleAnalysisChange = (index: number, field: keyof AISuggestions, value: string | number) => {
      if (!editableAnalysis) return;
      const updatedAnalysis = [...editableAnalysis];
      (updatedAnalysis[index] as any)[field] = value;
      setEditableAnalysis(updatedAnalysis);
  };

  const handleRemoveAnalysisItem = (index: number) => {
      if (!editableAnalysis) return;
      setEditableAnalysis(editableAnalysis.filter((_, i) => i !== index));
  };

  const handleConfirmAndAdd = () => {
      if (!editableAnalysis || editableAnalysis.length === 0) return;

      const componentsToAdd = editableAnalysis.map(item => ({
          name: item.name,
          description: item.description,
          category: item.category,
          totalQuantity: Number(item.quantity) || 1,
          issuedTo: [],
          isAvailable: true,
          imageUrl: item.imageUrl || 'https://placehold.co/400x300/1e293b/94a3b8/png?text=No+Image',
          links: [],
          lowStockThreshold: undefined,
      }));
      
      onAddMultipleComponents(componentsToAdd);
      setEditableAnalysis(null);
      setMessages(prev => [...prev, {
          sender: 'ai',
          text: `Great! I've added ${componentsToAdd.length} component type(s) to your inventory.`,
      }]);
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
              <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'} flex flex-col`}>
                {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="User provided" className="max-w-full h-auto rounded-md mb-2 object-cover max-h-48" />
                )}
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                {msg.analysisResult && editableAnalysis && index === messages.length -1 && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600 space-y-3">
                        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 px-1">
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-5">Name</div>
                            <div className="col-span-4">Category</div>
                        </div>
                        {editableAnalysis.map((item, itemIndex) => (
                            <div key={itemIndex} className="grid grid-cols-12 gap-2 items-center">
                                <input type="number" value={item.quantity} onChange={(e) => handleAnalysisChange(itemIndex, 'quantity', parseInt(e.target.value, 10) || 0)} className="col-span-2 bg-slate-700 border-slate-600 rounded p-1 text-sm text-center" />
                                <input type="text" value={item.name} onChange={(e) => handleAnalysisChange(itemIndex, 'name', e.target.value)} className="col-span-5 bg-slate-700 border-slate-600 rounded p-1 text-sm" />
                                <select value={item.category} onChange={(e) => handleAnalysisChange(itemIndex, 'category', e.target.value as Category)} className="col-span-4 bg-slate-700 border-slate-600 rounded p-1 text-sm">
                                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <button onClick={() => handleRemoveAnalysisItem(itemIndex)} className="col-span-1 text-slate-400 hover:text-red-500 flex justify-center">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {editableAnalysis.length > 0 && (
                            <button onClick={handleConfirmAndAdd} className="w-full mt-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-lg">
                                Confirm and Add to Inventory
                            </button>
                        )}
                    </div>
                )}
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
            
            <div className="flex items-center gap-3 mb-3">
                <label 
                    htmlFor="image-upload-input" 
                    className="p-2 bg-slate-700 text-slate-300 rounded-md cursor-pointer hover:bg-slate-600 transition-colors"
                    aria-label="Upload image"
                >
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