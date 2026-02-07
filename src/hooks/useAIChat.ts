import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface PatientData {
  profile?: {
    full_name?: string;
    gender?: string;
    date_of_birth?: string;
    blood_type?: string;
    height?: number;
    weight?: number;
  };
  allergies?: Array<{ allergy_name: string; severity?: string }>;
  medications?: Array<{ medication_name: string; dosage?: string; frequency?: string; is_active?: boolean }>;
  chronicDiseases?: Array<{ disease_name: string; diagnosis_date?: string }>;
  familyHistory?: Array<{ condition_name: string; relation?: string }>;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  // Fetch patient medical data
  const fetchPatientData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, allergiesRes, medicationsRes, chronicRes, familyRes] = await Promise.all([
      supabase.from('profiles').select('full_name, gender, date_of_birth, blood_type, height, weight').eq('user_id', user.id).single(),
      supabase.from('allergies').select('allergy_name, severity').eq('user_id', user.id),
      supabase.from('medications').select('medication_name, dosage, frequency, is_active').eq('user_id', user.id),
      supabase.from('chronic_diseases').select('disease_name, diagnosis_date').eq('user_id', user.id),
      supabase.from('family_history').select('condition_name, relation').eq('user_id', user.id),
    ]);

    setPatientData({
      profile: profileRes.data || undefined,
      allergies: allergiesRes.data || [],
      medications: medicationsRes.data || [],
      chronicDiseases: chronicRes.data || [],
      familyHistory: familyRes.data || [],
    });
  }, []);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  const fetchConversations = useCallback(async () => {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    setConversations(data || []);
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data?.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      attachments: (m.attachments as unknown as Attachment[]) || [],
      created_at: m.created_at
    })) || []);
  }, []);

  const createConversation = useCallback(async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('يجب تسجيل الدخول للاستخدام');
      return null;
    }

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      toast.error('خطأ في إنشاء المحادثة');
      return null;
    }

    setCurrentConversation(data.id);
    setMessages([]);
    await fetchConversations();
    return data.id;
  }, [fetchConversations]);

  const selectConversation = useCallback(async (conversationId: string) => {
    setCurrentConversation(conversationId);
    await fetchMessages(conversationId);
  }, [fetchMessages]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      toast.error('خطأ في حذف المحادثة');
      return;
    }

    if (currentConversation === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }

    await fetchConversations();
    toast.success('تم حذف المحادثة');
  }, [currentConversation, fetchConversations]);

  const sendMessage = useCallback(async (content: string, attachments: Attachment[] = []) => {
    if (!content.trim() && attachments.length === 0) return;

    let conversationId = currentConversation;
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) return;
    }

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      attachments,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);

    // Save user message to DB
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content,
      attachments: attachments as any
    });

    // Update conversation title with first message
    if (messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      await supabase
        .from('ai_conversations')
        .update({ title })
        .eq('id', conversationId);
      await fetchConversations();
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments
          })),
          patientData, // Send patient medical data with each request
        }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل في الاتصال');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';

      // Add empty assistant message
      const assistantId = crypto.randomUUID();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      }]);

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => prev.map(m => 
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save assistant message to DB
      await supabase.from('ai_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantContent
      });

      // Update conversation timestamp
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || 'خطأ في الاتصال بالمساعد الذكي');
      setMessages(prev => prev.filter(m => m.role !== 'assistant' || m.content));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [currentConversation, messages, patientData, createConversation, fetchConversations]);

  return {
    messages,
    conversations,
    currentConversation,
    isLoading,
    isStreaming,
    patientData,
    fetchConversations,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    refetchPatientData: fetchPatientData,
  };
}
