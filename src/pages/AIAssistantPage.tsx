import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, Menu, Sparkles } from 'lucide-react';
import { PatientNavbar } from '@/components/layout/PatientNavbar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatSidebar } from '@/components/ai-assistant/ChatSidebar';
import { ChatMessage } from '@/components/ai-assistant/ChatMessage';
import { ChatInput } from '@/components/ai-assistant/ChatInput';
import { useAIChat } from '@/hooks/useAIChat';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function AIAssistantPage() {
  const { isAuthenticated } = useAuth();
  const {
    messages,
    conversations,
    currentConversation,
    isLoading,
    isStreaming,
    fetchConversations,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
  } = useAIChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleNewChat = async () => {
    await createConversation();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PatientNavbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <ChatSidebar
          conversations={conversations}
          currentConversation={currentConversation}
          onNewChat={handleNewChat}
          onSelectConversation={(id) => {
            selectConversation(id);
            setSidebarOpen(false);
          }}
          onDeleteConversation={deleteConversation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="flex items-center gap-3 p-4 border-b border-border bg-card">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">المساعد الطبي الذكي</h1>
                <p className="text-xs text-muted-foreground">
                  {isStreaming ? 'يكتب...' : 'متاح للمساعدة'}
                </p>
              </div>
            </div>
          </header>

          {/* Messages Area */}
          <ScrollArea ref={scrollRef} className="flex-1">
            {messages.length === 0 ? (
              <EmptyState onStartChat={handleNewChat} />
            ) : (
              <div className="divide-y divide-border">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            disabled={!isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onStartChat }: { onStartChat: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center"
    >
      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">مرحباً بك في المساعد الطبي الذكي</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        يمكنني مساعدتك في فهم أعراضك، تحليل تقاريرك الطبية، وتقديم معلومات صحية موثوقة.
        يمكنك أيضاً إرفاق صور أو ملفات طبية للتحليل.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
        {[
          'ما هي أعراض نقص فيتامين د؟',
          'كيف أقرأ تحليل الدم CBC؟',
          'ما هي أسباب الصداع المتكرر؟',
          'نصائح لتحسين جودة النوم',
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={onStartChat}
            className="p-3 text-sm bg-secondary hover:bg-secondary/80 rounded-lg text-right transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        ⚠️ تنبيه: المساعد الذكي لا يغني عن استشارة الطبيب المختص
      </p>
    </motion.div>
  );
}
