import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { StockData, TeachingMessage } from '@/lib/types';
import { Robot, PaperPlaneRight, X } from '@phosphor-icons/react';
import { generateTeachingQuestion, evaluateTeachingAnswer } from '@/lib/ai-analysis';
import { motion } from 'framer-motion';

interface TeachingAssistantProps {
  stock: StockData;
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_STEPS = 6;

export function TeachingAssistant({ stock, isOpen, onClose }: TeachingAssistantProps) {
  const [messages, setMessages] = useState<TeachingMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startSession();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async () => {
    const welcomeMessage: TeachingMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `Hi! I'm your AI teaching assistant. Let's learn how to analyze ${stock.symbol} together. I'll ask you questions about different aspects of stock analysis, and we'll explore each concept step by step. Ready to begin?`,
      timestamp: new Date().toISOString(),
    };

    setMessages([welcomeMessage]);
    await askNextQuestion();
  };

  const askNextQuestion = async () => {
    setIsLoading(true);
    try {
      const question = await generateTeachingQuestion(
        stock,
        currentStep,
        TOTAL_STEPS,
        messages.filter(m => m.role === 'user').map(m => m.content)
      );

      const questionMessage: TeachingMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: question,
        timestamp: new Date().toISOString(),
        questionId: `q-${currentStep}`,
      };

      setMessages(prev => [...prev, questionMessage]);
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: TeachingMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const lastQuestion = messages.filter(m => m.role === 'assistant').slice(-1)[0];
      const feedback = await evaluateTeachingAnswer(
        lastQuestion.content,
        userInput,
        stock
      );

      const feedbackMessage: TeachingMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: feedback,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, feedbackMessage]);

      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(prev => prev + 1);
        setTimeout(askNextQuestion, 1500);
      } else {
        const completionMessage: TeachingMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `🎉 Excellent work! You've completed the ${stock.symbol} analysis session. You've learned about price movements, volume, trends, and how to interpret market data like a pro. Keep practicing these skills with different stocks!`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, completionMessage]);
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  const handleClose = () => {
    setMessages([]);
    setCurrentStep(0);
    setUserInput('');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Robot size={24} className="text-primary" />
              Learn to Analyze {stock.symbol}
            </SheetTitle>
          </div>
          <SheetDescription>
            Interactive step-by-step stock analysis training
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {TOTAL_STEPS}
            </span>
            <span className="text-sm font-medium">
              {Math.round(((currentStep + 1) / TOTAL_STEPS) * 100)}% Complete
            </span>
          </div>
          <Progress value={((currentStep + 1) / TOTAL_STEPS) * 100} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Robot size={16} className="text-primary" />
                      <span className="text-xs font-medium text-primary">AI Teacher</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Type your answer..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || currentStep >= TOTAL_STEPS}
            />
            <Button
              onClick={handleSubmitAnswer}
              disabled={!userInput.trim() || isLoading || currentStep >= TOTAL_STEPS}
              size="icon"
            >
              <PaperPlaneRight size={20} />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
