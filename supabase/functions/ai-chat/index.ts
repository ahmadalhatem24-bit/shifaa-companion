import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

function buildSystemPrompt(patientData?: PatientData): string {
  let prompt = `أنت مساعد طبي ذكي يتحدث العربية. مهمتك هي:
1. تحليل الأعراض والشكاوى الطبية التي يصفها المستخدم
2. تقديم معلومات طبية عامة ونصائح صحية مخصصة
3. المساعدة في فهم التقارير الطبية والتحاليل المخبرية
4. اقتراح الإجراءات المناسبة مع مراعاة الحالة الصحية للمريض

تنبيه مهم: أنت لست بديلاً عن الطبيب المختص. دائماً أنصح المستخدم بمراجعة الطبيب للحصول على التشخيص والعلاج المناسب.

إذا تم إرفاق صور أو ملفات طبية، قم بتحليلها وتقديم ملاحظات مفيدة مع التأكيد على ضرورة استشارة المختص.`;

  if (patientData) {
    prompt += `\n\n--- بيانات المريض الصحية ---`;
    
    if (patientData.profile) {
      const p = patientData.profile;
      prompt += `\n\nالبيانات الشخصية:`;
      if (p.full_name) prompt += `\n- الاسم: ${p.full_name}`;
      if (p.gender) prompt += `\n- الجنس: ${p.gender === 'male' ? 'ذكر' : p.gender === 'female' ? 'أنثى' : p.gender}`;
      if (p.date_of_birth) {
        const age = Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        prompt += `\n- العمر: ${age} سنة`;
      }
      if (p.blood_type) prompt += `\n- فصيلة الدم: ${p.blood_type}`;
      if (p.height) prompt += `\n- الطول: ${p.height} سم`;
      if (p.weight) prompt += `\n- الوزن: ${p.weight} كغ`;
      if (p.height && p.weight) {
        const bmi = (p.weight / Math.pow(p.height / 100, 2)).toFixed(1);
        prompt += `\n- مؤشر كتلة الجسم (BMI): ${bmi}`;
      }
    }

    if (patientData.allergies && patientData.allergies.length > 0) {
      prompt += `\n\nالحساسية:`;
      patientData.allergies.forEach(a => {
        prompt += `\n- ${a.allergy_name}${a.severity ? ` (${a.severity})` : ''}`;
      });
      prompt += `\n⚠️ تحذير: يجب مراعاة هذه الحساسيات عند تقديم أي نصائح دوائية!`;
    }

    if (patientData.medications && patientData.medications.length > 0) {
      const activeMeds = patientData.medications.filter(m => m.is_active !== false);
      if (activeMeds.length > 0) {
        prompt += `\n\nالأدوية الحالية:`;
        activeMeds.forEach(m => {
          prompt += `\n- ${m.medication_name}`;
          if (m.dosage) prompt += ` - الجرعة: ${m.dosage}`;
          if (m.frequency) prompt += ` - ${m.frequency}`;
        });
        prompt += `\n⚠️ تحذير: يجب مراعاة التداخلات الدوائية المحتملة!`;
      }
    }

    if (patientData.chronicDiseases && patientData.chronicDiseases.length > 0) {
      prompt += `\n\nالأمراض المزمنة:`;
      patientData.chronicDiseases.forEach(d => {
        prompt += `\n- ${d.disease_name}`;
        if (d.diagnosis_date) prompt += ` (منذ ${d.diagnosis_date})`;
      });
    }

    if (patientData.familyHistory && patientData.familyHistory.length > 0) {
      prompt += `\n\nالتاريخ العائلي:`;
      patientData.familyHistory.forEach(f => {
        prompt += `\n- ${f.condition_name}`;
        if (f.relation) prompt += ` (${f.relation})`;
      });
    }

    prompt += `\n\n--- نهاية بيانات المريض ---`;
    prompt += `\n\nاستخدم هذه البيانات لتقديم نصائح مخصصة ومراعاة الحالة الصحية للمريض في جميع إجاباتك.`;
  }

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, attachments, patientData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(patientData);

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
        model: "google/gemini-2.5-flash",
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