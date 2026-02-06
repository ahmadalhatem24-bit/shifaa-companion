import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/hooks/useAIChat';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversation: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({
  conversations,
  currentConversation,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 7) return `منذ ${days} أيام`;
    return date.toLocaleDateString('ar-SY');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed lg:relative inset-y-0 right-0 z-50 w-72 bg-card border-l border-border flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">المحادثات</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onNewChat} className="gap-2">
              <Plus className="h-4 w-4" />
              محادثة جديدة
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                لا توجد محادثات سابقة
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
                    currentConversation === conv.id && "bg-secondary"
                  )}
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(conv.updated_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
