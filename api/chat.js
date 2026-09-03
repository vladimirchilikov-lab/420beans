const { createClient } = require('@supabase/supabase-js');

const ANTHROPIC_MODEL = 'claude-sonnet-5';
const MAX_TURNS = 8;          // колко последни съобщения пазим (потребител + бот)
const MAX_MSG_LEN = 600;      // макс. дължина на едно съобщение от потребителя
const MAX_TOKENS = 500;

function buildCatalogBlock(products) {
  if (!products || !products.length) return 'Каталогът в момента е празен.';
  return products
    .map((p) => {
      const notes = p.description || p.notes || '';
      const roast = typeof p.roast === 'number' ? `${p.roast}/100` : '';
      return `- "${p.name}" (${p.category || 'кафе'})${roast ? ` · печене ${roast}` : ''}${
        notes ? ` · ${notes}` : ''
      } · ${p.price ? `${p.price}€/250г` : ''}`;
    })
    .join('\n');
}

function buildSystemPrompt(catalogBlock, lang) {
  const langInstruction =
    lang === 'en'
      ? 'Reply in English unless the customer writes in another language, in which case match their language.'
      : 'Отговаряй на български език, освен ако клиентът не пише на друг език — тогава минавай на неговия.';

  return `Ти си "Бийн" — приятелски, компетентен AI консултант по кафе за онлайн магазина 420 Beans (specialty coffee, ясен произход "ферма до чаша").

${langInstruction}

РОЛЯ:
1. Помагаш на клиентите да изберат кафе от каталога според вкус, интензивност, начин на приготвяне и повод.
2. Даваш конкретни, практични съвети как се приготвя кафе — съотношение кафе/вода, температура, време, смилане — за метод по избор на клиента (V60/пуроувър, френска преса, moka, aeropress, еспресо машина, cold brew).
3. Никога не измисляш продукти — препоръчваш само от списъка по-долу, точно с изписаните имена.
4. Ако клиентът не спомене метод на приготвяне, кратко питаш с какво разполага (машина, преса, филтър и т.н.), преди да дадеш рецепта — освен ако вече е ясно от контекста.
5. Тон: топъл, кратък, без излишни клишета. Отговори в 3-6 изречения освен ако не се иска подробна рецепта — тогава може списък със стъпки.
6. Не даваш медицински съвети (напр. за кофеин и здравословни състояния) — при такива въпроси препращаш учтиво към лекар.
7. Не отговаряш на теми извън кафе, приготвяне на кафе и продуктите на магазина — учтиво връщаш разговора към кафето.

ТЕКУЩ КАТАЛОГ (кафета и мърч, живи данни от базата):
${catalogBlock}

Ако клиент попита за нещо извън наличния каталог (напр. декаф, ако липсва), кажи честно, че в момента не е налично, и предложи най-близката алтернатива от списъка.`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY env variable');
    }

    const { messages, lang } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing messages' });
    }

    // Санитизация и ограничаване на историята, за да пазим разходите и промпт-инжекциите ниски
    const cleanMessages = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_TURNS)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, MAX_MSG_LEN),
      }));

    if (!cleanMessages.length || cleanMessages[cleanMessages.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from the user' });
    }

    // Взимаме живия каталог от Supabase, за да препоръчваме само реални продукти
    let products = [];
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const { data } = await supabase
        .from('products')
        .select('name, description, price, category')
        .order('created_at', { ascending: true });
      products = data || [];
    }

    const systemPrompt = buildSystemPrompt(buildCatalogBlock(products), lang === 'en' ? 'en' : 'bg');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: cleanMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    const reply = (data.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    return res.status(200).json({ reply: reply || '…' });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Failed to get a response', detail: err.message });
  }
};
