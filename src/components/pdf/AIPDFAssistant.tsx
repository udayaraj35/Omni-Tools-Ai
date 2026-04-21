'use client';
import React, { useState } from 'react';
import { Sparkles, Lightbulb, Rocket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AIPDFAssistant = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const aiSuggestions = [
    "Compress all PDFs in folder",
    "Merge these 3 documents by date",
    "Convert these images to PDF",
    "Add watermark to all pages",
    "Extract text from scanned PDF",
    "Remove blank pages automatically",
    "Split PDF by bookmark",
    "Optimize for web viewing"
  ];

  const handleAIRequest = async () => {
    if (!aiQuery.trim()) return;
    
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setAiResponse(`AI Recommendation: I suggest using "Smart Compress" for your PDF as it's 85% similar to previous optimizations. This will reduce file size by approximately 40% without quality loss.`);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI PDF Assistant</h2>
              <p className="text-white/80 text-sm">Smart recommendations powered by AI</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-white text-sm">AI Active</span>
          </div>
        </div>

        {/* AI Input */}
        <div className="relative mb-4">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Lightbulb className="h-5 w-5 text-white/70" />
          </div>
          <Input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="Describe what you want to do with your PDF..."
            className="w-full pl-12 pr-32 py-4 h-14 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            onKeyPress={(e) => e.key === 'Enter' && handleAIRequest()}
          />
          <Button
            onClick={handleAIRequest}
            disabled={isProcessing}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            {isProcessing ? 'Thinking...' : 'Ask AI'}
          </Button>
        </div>

        {/* AI Suggestions */}
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <Zap className="h-4 w-4 text-white/80 mr-2" />
            <span className="text-white/90 text-sm font-medium">Quick Suggestions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                onClick={() => setAiQuery(suggestion)}
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-start">
              <Rocket className="h-5 w-5 text-white mr-2 mt-1" />
              <p className="text-white text-sm">{aiResponse}</p>
            </div>
          </div>
        )}
    </div>
  );
};

export default AIPDFAssistant;
