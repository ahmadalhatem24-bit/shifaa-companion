import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, X, Image, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Attachment } from '@/hooks/useAIChat';

interface ChatInputProps {
  onSend: (message: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`الملف ${file.name} كبير جداً (الحد الأقصى 10MB)`);
        continue;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('يجب تسجيل الدخول لرفع الملفات');
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('medical-records')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast.error(`فشل في رفع ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('medical-records')
          .getPublicUrl(data.path);

        setAttachments(prev => [...prev, {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          url: urlData.publicUrl,
          size: file.size,
        }]);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`فشل في رفع ${file.name}`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSend = () => {
    if ((!message.trim() && attachments.length === 0) || isLoading || isUploading) return;
    
    onSend(message, attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm"
            >
              {attachment.type.startsWith('image/') ? (
                <Image className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="truncate max-w-[150px]">{attachment.name}</span>
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* File Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept="image/*,.pdf,.doc,.docx"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isLoading || disabled}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </Button>

        {/* Message Input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك هنا..."
          className="min-h-[44px] max-h-32 resize-none"
          disabled={isLoading || disabled}
          rows={1}
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && attachments.length === 0) || isLoading || isUploading || disabled}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        ⚠️ المساعد الذكي لا يغني عن استشارة الطبيب المختص
      </p>
    </div>
  );
}
