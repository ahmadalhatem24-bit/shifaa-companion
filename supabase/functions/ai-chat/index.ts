import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, attachments } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the messages array with system prompt
    const systemPrompt = `أنت مساعد طبي ذكي يتحدث العربية. مهمتك هي:
1. تحليل الأعراض والشكاوى الطبية التي يصفها المستخدم
2. تقديم معلومات طبية عامة ونصائح صحية
3. المساعدة في فهم التقارير الطبية والتحاليل المخبرية
4. اقتراح الإجراءات المناسبة

تنبيه مهم: أنت لست بديلاً عن الطبيب المختص. دائماً أنصح المستخدم بمراجعة الطبيب للحصول على التشخيص والعلاج المناسب.

إذا تم إرفاق صور أو ملفات طبية، قم بتحليلها وتقديم ملاحظات مفيدة مع التأكيد على ضرورة استشارة المختص.`;

    // Process attachments if any
    const processedMessages = messages.map((msg: any) => {
      if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
        const content: any[] = [{ type: 'text', text: msg.content }];
        
        for (const attachment of msg.attachments) {
          if (attachment.type.startsWith('image/')) {
            content.push({
              type: 'image_url',
              image_url: { url: attachment.url }
            });
          }
        }
        
        return { role: msg.role, content };
      }
      return { role: msg.role, content: msg.content };
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...processedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للاستمرار في استخدام المساعد الذكي" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "خطأ في الاتصال بالمساعد الذكي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
