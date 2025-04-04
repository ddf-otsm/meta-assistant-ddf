import { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Message } from '@shared/schema';

interface AIAssistantProps {
  projectId: number;
  messages: Message[];
  onMessagesUpdate: (messages: Message[]) => void;
}

export default function AIAssistant({ projectId, messages, onMessagesUpdate }: AIAssistantProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when messages update
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);

    try {
      // Add user message to the UI immediately
      const userMessage: Message = {
        role: 'user',
        content: newMessage,
        timestamp: new Date(),
      };
      onMessagesUpdate([...messages, userMessage]);

      // Send message to the server
      const res = await apiRequest('POST', `/api/projects/${projectId}/conversation`, {
        message: newMessage,
      });
      const conversation = await res.json();

      // Update with the complete conversation from the server
      onMessagesUpdate(conversation.messages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      console.error('Error sending message:', error);
    } finally {
      setNewMessage('');
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-dark-200 shadow-sm overflow-hidden mb-6">
      <div className="border-b border-dark-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-secondary-600 text-white flex items-center justify-center mr-2">
            <i className="ri-robot-line"></i>
          </div>
          <h2 className="font-semibold text-dark-800">AI Assistant</h2>
        </div>
        <button className="text-dark-500 hover:text-dark-700">
          <i className="ri-settings-3-line"></i>
        </button>
      </div>

      <div className="p-4 h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-dark-500">
              <div className="text-center">
                <i className="ri-robot-line text-3xl mb-2"></i>
                <p>Ask the AI assistant anything about your project!</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-secondary-600 text-white flex items-center justify-center mr-2 flex-shrink-0">
                    <i className="ri-robot-line"></i>
                  </div>
                )}
                <div
                  className={`${
                    message.role === 'user'
                      ? 'bg-primary-100 rounded-lg rounded-tr-none text-dark-800'
                      : 'bg-dark-100 rounded-lg rounded-tl-none text-dark-800'
                  } p-3 text-sm max-w-xs sm:max-w-md whitespace-pre-wrap`}
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(
                        /```([\s\S]*?)```/g,
                        '<pre class="bg-dark-800 text-white p-2 rounded mt-2 overflow-x-auto font-mono text-xs">$1</pre>'
                      )
                      .replace(/\n/g, '<br>'),
                  }}
                />
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center ml-2 flex-shrink-0">
                    <span className="text-xs font-bold">You</span>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Ask me anything about your API generator..."
            className="flex-1"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <Button
            className="ml-2 bg-secondary-600 hover:bg-secondary-700 text-white p-2 rounded-md transition"
            onClick={handleSendMessage}
            disabled={isSending}
          >
            {isSending ? (
              <i className="ri-loader-4-line animate-spin"></i>
            ) : (
              <i className="ri-send-plane-fill"></i>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
