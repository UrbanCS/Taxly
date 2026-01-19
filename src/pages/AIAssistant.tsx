import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Paperclip, 
  Mic, 
  MicOff,
  FileText,
  Calculator,
  BarChart3,
  Lightbulb,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Brain,
  Sparkles,
  TrendingUp,
  DollarSign,
  Shield
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  attachments?: string[];
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI Tax Assistant. I can help you with tax calculations, deduction optimization, compliance questions, and document analysis. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "Calculate my estimated taxes",
        "Find potential deductions",
        "Explain tax regulations",
        "Analyze my documents"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    if (input.includes('tax') && input.includes('calculate')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I can help you calculate your taxes! Based on your profile, here's what I found:\n\n• Estimated annual income: $75,000\n• Potential deductions: $8,400\n• Estimated tax liability: $12,847\n• Effective tax rate: 17.1%\n\nWould you like me to run a detailed calculation or explore additional deductions?",
        timestamp: new Date(),
        suggestions: [
          "Run detailed calculation",
          "Find more deductions",
          "Explain tax brackets",
          "Save this calculation"
        ]
      };
    }
    
    if (input.includes('deduction')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Great question about deductions! I've analyzed your documents and found several opportunities:\n\n🏠 **Home Office**: $2,400/year\n📚 **Professional Development**: $1,200/year\n🚗 **Business Vehicle Use**: $3,200/year\n💻 **Equipment & Software**: $1,800/year\n\nTotal potential savings: **$8,600** which could reduce your tax liability by approximately **$2,150**!",
        timestamp: new Date(),
        suggestions: [
          "Add these deductions",
          "Learn about home office rules",
          "Track vehicle expenses",
          "See all deduction categories"
        ]
      };
    }
    
    if (input.includes('document') || input.includes('receipt')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I can analyze your documents instantly! Here's what I can do:\n\n📄 **Extract Data**: Pull amounts, dates, vendors from receipts\n🏷️ **Categorize**: Automatically sort expenses by tax category\n✅ **Validate**: Check for compliance and completeness\n💡 **Suggest**: Recommend additional deductions\n\nJust upload your documents and I'll process them in seconds!",
        timestamp: new Date(),
        suggestions: [
          "Upload documents now",
          "See processing demo",
          "Learn about OCR accuracy",
          "View supported formats"
        ]
      };
    }
    
    if (input.includes('deadline') || input.includes('due')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Here are your upcoming tax deadlines:\n\n📅 **Q4 2024 Estimated Taxes**: January 15, 2025 (⚠️ 3 days remaining)\n📅 **Annual Tax Return**: April 15, 2025\n📅 **Q1 2025 Estimated Taxes**: April 15, 2025\n\nI'll send you reminders and help you prepare everything on time!",
        timestamp: new Date(),
        suggestions: [
          "Set up reminders",
          "Prepare Q4 payment",
          "Start annual return prep",
          "View full tax calendar"
        ]
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: "I understand you're asking about tax-related matters. I'm here to help with:\n\n• Tax calculations and planning\n• Deduction optimization\n• Document analysis and processing\n• Compliance and deadline tracking\n• Tax law explanations\n\nCould you be more specific about what you'd like help with?",
      timestamp: new Date(),
      suggestions: [
        "Calculate my taxes",
        "Find deductions",
        "Upload documents",
        "Check deadlines"
      ]
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(file => file.name);
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `Uploaded ${files.length} file(s): ${fileNames.join(', ')}`,
        timestamp: new Date(),
        attachments: fileNames
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
      
      setTimeout(() => {
        const aiResponse: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Perfect! I've analyzed your uploaded documents:\n\n✅ **${fileNames[0]}**: Receipt processed - $156.78 business expense\n✅ **Data extracted**: Vendor, date, amount, category\n✅ **Tax category**: Office supplies (100% deductible)\n\nThis receipt will save you approximately **$39** in taxes. Would you like me to add it to your deductions?`,
          timestamp: new Date(),
          suggestions: [
            "Add to deductions",
            "Process more documents",
            "View extraction details",
            "Export processed data"
          ]
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input implementation would go here
  };

  const quickActions = [
    { icon: Calculator, label: 'Tax Calculator', color: 'blue' },
    { icon: FileText, label: 'Upload Documents', color: 'green' },
    { icon: BarChart3, label: 'View Analytics', color: 'purple' },
    { icon: Lightbulb, label: 'Find Deductions', color: 'yellow' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">AI Tax Assistant</h1>
              <p className="text-gray-600 text-lg">Your intelligent tax companion powered by advanced AI</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  switch (action.label) {
                    case 'Tax Calculator':
                      window.location.href = '/calculator';
                      break;
                    case 'Upload Documents':
                      window.location.href = '/upload';
                      break;
                    case 'View Analytics':
                      window.location.href = '/analytics';
                      break;
                    case 'Find Deductions':
                      setInputMessage('Find potential deductions for my business');
                      break;
                  }
                }}
                className={`p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 card-hover group`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  action.color === 'blue' ? 'bg-blue-100' :
                  action.color === 'green' ? 'bg-green-100' :
                  action.color === 'purple' ? 'bg-purple-100' :
                  'bg-yellow-100'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className={`w-5 h-5 ${
                    action.color === 'blue' ? 'text-blue-600' :
                    action.color === 'green' ? 'text-green-600' :
                    action.color === 'purple' ? 'text-purple-600' :
                    'text-yellow-600'
                  }`} />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">TAXLY AI Assistant</h3>
                <div className="flex items-center space-x-2 text-white/90">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Online and ready to help</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-100' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div className={`flex-1 max-w-2xl ${
                  message.type === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-line">{message.content}</p>
                    {message.attachments && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((file, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-white/20 rounded-lg">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{file}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  
                  {message.suggestions && message.type === 'assistant' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="p-4 bg-gray-100 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about taxes..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  onClick={toggleVoiceInput}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    isListening ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Analysis</h3>
            <p className="text-gray-600">Upload documents and get instant AI-powered analysis with 99.7% accuracy.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Optimization</h3>
            <p className="text-gray-600">AI finds hidden deductions and optimization opportunities to maximize your savings.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Compliance Monitoring</h3>
            <p className="text-gray-600">Real-time compliance checking ensures you stay within all tax regulations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;