// src/services/aiService.jsx

// ✅ إعدادات AI
const AI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '', // من متغيرات البيئة
  model: 'gpt-3.5-turbo',
  maxTokens: 150,
  temperature: 0.7,
  fallbackResponses: [
    'عذراً، حصل خطأ في الاتصال. جرب مرة تانية.',
    'مش قادر أوصلك دلوقتي. حاول تسأل تاني.',
    'في مشكلة في الشبكة. كرر السؤال لو سمحت.',
  ]
};

// ✅ رسالة النظام
const getSystemMessage = () => {
  return `أنت مساعد ذكي في منصة "طلب صناعي" المتخصصة في ربط العملاء بالحرفيين.
المنصة فيها حرفيين في تخصصات: سباكة، كهرباء، نجارة، دهان، تكييف، بناء، حدادة، تنظيف.
ساعد المستخدم في:
1. تحديد نوع الحرفي المناسب لمشكلته
2. نصحه بالبحث عن حرفي قريب
3. شرح كيفية استخدام المنصة
4. الإجابة عن أسئلته
خلي ردودك قصيرة ومفيدة بالعامية المصرية.`;
};

// ✅ دالة مساعدة للحصول على رد عشوائي (Fallback)
const getFallbackResponse = () => {
  const fallbacks = [
    'عذراً، مش قادر أوصلك دلوقتي. حاول تسأل تاني.',
    'في مشكلة في الاتصال. كرر السؤال لو سمحت.',
    'آسف، حصل خطأ. جرب مرة أخرى.',
    'مش فاهم السؤال. ممكن توضح أكثر؟',
    'أنا هنا عشان أساعدك. إيه المشكلة بالضبط؟'
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

// ✅ دالة التحقق من مفتاح API
const hasValidApiKey = () => {
  const key = AI_CONFIG.apiKey;
  return key && key.length > 10 && key !== 'YOUR_API_KEY_HERE';
};

// ✅ خدمة AI الرئيسية
const aiService = {
  // ✅ دالة السؤال الرئيسية
  askAI: async (userMessage, conversationHistory = []) => {
    // ✅ التحقق من وجود مفتاح API
    if (!hasValidApiKey()) {
      console.warn('⚠️ No valid API key found. Using fallback responses.');
      return getFallbackResponse();
    }

    // ✅ بناء الرسائل
    const messages = [
      { role: 'system', content: getSystemMessage() },
      ...conversationHistory.slice(-5),
      { role: 'user', content: userMessage }
    ];

    try {
      // ✅ محاولة الاتصال بـ OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: messages,
          max_tokens: AI_CONFIG.maxTokens,
          temperature: AI_CONFIG.temperature,
        })
      });

      // ✅ التحقق من الاستجابة
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ OpenAI API Error:', errorData);
        
        // ✅ معالجة أخطاء محددة
        if (response.status === 401) {
          return '⚠️ مفتاح API غير صالح. يرجى التواصل مع الدعم الفني.';
        }
        if (response.status === 429) {
          return '⏳ عدد الطلبات كبير جداً. انتظر شوية وجرب تاني.';
        }
        if (response.status === 500) {
          return '❌ حدث خطأ في الخادم. جرب مرة أخرى.';
        }
        return getFallbackResponse();
      }

      const data = await response.json();
      
      // ✅ التحقق من وجود الرد
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        console.warn('⚠️ No response from AI');
        return getFallbackResponse();
      }

    } catch (error) {
      console.error('❌ AI Service Error:', error.message);
      
      // ✅ معالجة أخطاء الشبكة
      if (error.message === 'Failed to fetch' || error.message.includes('network')) {
        return '📡 مشكلة في الاتصال بالإنترنت. تأكد من اتصالك وحاول مرة أخرى.';
      }
      
      return getFallbackResponse();
    }
  },

  // ✅ دالة لفحص حالة الخدمة
  checkHealth: async () => {
    if (!hasValidApiKey()) {
      return { status: 'error', message: 'API key not configured' };
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`
        }
      });
      return { 
        status: response.ok ? 'ok' : 'error', 
        message: response.ok ? 'Service is available' : 'Service is unavailable' 
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },

  // ✅ دالة لتحديث مفتاح API
  setApiKey: (newKey) => {
    AI_CONFIG.apiKey = newKey;
    // ✅ حفظ في localStorage
    localStorage.setItem('openai_api_key', newKey);
  },

  // ✅ دالة لتحميل المفتاح من localStorage
  loadApiKey: () => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      AI_CONFIG.apiKey = savedKey;
    }
    return AI_CONFIG.apiKey;
  }
};

// ✅ تحميل المفتاح عند بدء التشغيل
aiService.loadApiKey();

export default aiService;