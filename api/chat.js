```javascript
const { createClient } = require('@supabase/supabase-js');

const GROQ_MODEL = 'openai/gpt-oss-20b';
const MAX_TURNS = 8;
const MAX_MSG_LEN = 600;
const MAX_TOKENS = 500;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

function cleanText(value, maxLength = 300) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

async function getCatalog() {
  const supabase = getSupabase();

  if (!supabase) {
    return {
      products: [],
      text: 'Продуктовият каталог временно не е достъпен.'
    };
  }

  const { data, error } = await supabase
    .from('products')
    .select('name, description, price, category');

  if (error) {
    console.error('Supabase catalog error:', error.message);

    return {
      products: [],
      text: 'Продуктовият каталог временно не е достъпен.'
    };
  }

  const products = Array.isArray(data) ? data : [];

  const text = products.length
    ? products.map(function (product) {
        return [
          'Име: ' + (product.name || 'Не е посочено'),
          'Описание: ' + (product.description || 'Няма описание'),
          'Цена: ' + (
            product.price !== null && product.price !== undefined
              ? String(product.price) + ' EUR'
              : 'Не е посочена'
          ),
          'Категория: ' + (product.category || 'Не е посочена')
        ].join('\n');
      }).join('\n\n')
    : 'В каталога няма върнати продукти. Не измисляй продукти.';

  return {
    products: products,
    text: text
  };
}

function buildSystemPrompt(catalogBlock, lang) {
  const langInstruction = lang === 'en'
    ? 'Reply in natural, fluent English. Match the customer language.'
    : 'Отговаряй на естествен, граматически правилен български език. Не превеждай буквално от английски.';

  const sections = [
    'Ти си Бийн — консултант по специално кафе в онлайн магазина 420 Beans.',
    langInstruction,
    '',
    'СТИЛ НА ОБЩУВАНЕ:',
    '- Говори естествено, приятелски и компетентно, като опитен бариста.',
    '- Използвай съвременен, граматически правилен български език.',
    '- Отговаряй кратко и конкретно, обикновено в 2–5 изречения.',
    '- Не започвай всеки отговор с „Разбира се!“ или „Благодарим за въпроса!“.',
    '- Не използвай таблици, освен ако клиентът изрично не ги поиска.',
    '- Не задавай излишни уточняващи въпроси.',
    '- Не измисляй думи и не превеждай буквално от английски.',
    '',
    'ПРАВИЛНА КАФЕ ТЕРМИНОЛОГИЯ:',
    '- grind size: едрина на смилане;',
    '- medium grind: средно смилане;',
    '- medium-fine grind: средно фино смилане;',
    '- body: плътност на кафето или тяло;',
    '- brew time: време за приготвяне;',
    '- pouring technique: техника на наливане;',
    '- drawdown: оттичане на водата;',
    '- extraction: екстракция;',
    '- ratio: съотношение кафе/вода;',
    '- espresso yield: количество готово еспресо в чашата;',
    '- tasting notes: вкусови нотки;',
    '- roast level: степен на изпичане.',
    '',
    'Не използвай изрази като „полу-гъста смиля“, „бързо пресуване“, „поддържане на дебелина“ или „волумен на изхода“.',
    '',
    'ТВОИТЕ ЗАДАЧИ:',
    '1. Помагаш на клиентите да изберат кафе според вкуса и метода на приготвяне.',
    '2. Препоръчваш само продукти от каталога по-долу.',
    '3. Не измисляш цени, наличности, произход, обработка или вкусови нотки.',
    '4. Ако информацията липсва в каталога, кажи го честно.',
    '5. При рецепта посочвай подходящи количества, температура, едрина на смилане и ориентировъчно време.',
    '6. При V60 обяснявай дозата кафе, количеството вода, температурата, смилането и времето.',
    '7. При еспресо обяснявай дозата кафе, количеството готово еспресо и времето за екстракция.',
    '8. Представяй рецептите като отправна точка, а не като абсолютни правила.',
    '9. Не давай медицински съвети.',
    '10. Ако въпросът е извън темата на кафето, учтиво насочи разговора към магазина.',
    '',
    'ВАЖНО ЗА КАТАЛОГА:',
    '- Използвай само информацията, която действително присъства в каталога.',
    '- Не твърди, че продукт е наличен, ако нямаш надеждна информация за наличността.',
    '- Цените са в евро само когато са посочени в каталога.',
    '',
    'ПРОДУКТОВ КАТАЛОГ:',
    catalogBlock,
    '',
    'Използвай каталога като източник на информация. Не измисляй липсващи данни.'
  ];

  return sections.join('\n');
}

function detectLanguage(messages) {
  const lastUserMessage = messages
    .slice()
    .reverse()
    .find(function (message) {
      return message.role === 'user';
    });

  if (!lastUserMessage) {
    return 'bg';
  }

  const text = lastUserMessage.content;

  const cyrillicCount = (text.match(/[А-Яа-яЁё]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;

  return latinCount > cyrillicCount ? 'en' : 'bg';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Методът не е разрешен.'
    });
  }

  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    console.error('Missing GROQ_API_KEY');

    return res.status(500).json({
      error: 'Чатботът временно не е достъпен.'
    });
  }

  try {
    const body = req.body || {};
    const incomingMessages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const messages = incomingMessages
      .filter(function (message) {
        return (
          message &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string'
        );
      })
      .slice(-MAX_TURNS)
      .map(function (message) {
        return {
          role: message.role,
          content: cleanText(message.content, MAX_MSG_LEN)
        };
      })
      .filter(function (message) {
        return message.content.length > 0;
      });

    if (!messages.length) {
      return res.status(400).json({
        error: 'Моля, напишете съобщение.'
      });
    }

    const lang = detectLanguage(messages);
    const catalog = await getCatalog();
    const systemPrompt = buildSystemPrompt(catalog.text, lang);

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + groqApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            }
          ].concat(messages),
          temperature: 0.4,
          max_tokens: MAX_TOKENS
        })
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();

      console.error(
        'Groq API error:',
        groqResponse.status,
        errorText.slice(0, 500)
      );

      return res.status(502).json({
        error: 'Не успях да подготвя отговор. Опитайте отново след малко.'
      });
    }

    const result = await groqResponse.json();
    const answer =
      result &&
      result.choices &&
      result.choices[0] &&
      result.choices[0].message &&
      result.choices[0].message.content;

    if (typeof answer !== 'string' || !answer.trim()) {
      console.error('Groq returned an empty answer');

      return res.status(502).json({
        error: 'Не получих отговор. Моля, опитайте отново.'
      });
    }

    return res.status(200).json({
      reply: answer.trim()
    });
  } catch (error) {
    console.error('Chat API error:', error.message);

    return res.status(500).json({
      error: 'Възникна временна грешка. Моля, опитайте отново.'
    });
  }
};
```
