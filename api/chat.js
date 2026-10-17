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

function cleanText(value, maxLength) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength || MAX_MSG_LEN);
}

async function getCatalog() {
  const supabase = getSupabase();

  if (!supabase) {
    console.error('Missing Supabase environment variables');
    return 'Каталогът временно не е достъпен.';
  }

  const result = await supabase
    .from('products')
    .select('name, description, price, category');

  if (result.error) {
    console.error('Supabase error:', result.error.message);
    return 'Каталогът временно не е достъпен.';
  }

  const products = Array.isArray(result.data) ? result.data : [];

  if (products.length === 0) {
    return 'В каталога няма върнати продукти. Не измисляй продукти.';
  }

  return products.map(function (product) {
    const name = product.name || 'Не е посочено';
    const description = product.description || 'Няма описание';
    const category = product.category || 'Не е посочена';

    let price = 'Не е посочена';

    if (product.price !== null && product.price !== undefined) {
      price = String(product.price) + ' EUR';
    }

    return [
      'Име: ' + name,
      'Описание: ' + description,
      'Цена: ' + price,
      'Категория: ' + category
    ].join('\n');
  }).join('\n\n');
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
    '- Използвай правилен, съвременен и разговорен български език.',
    '- Отговаряй кратко и конкретно, обикновено в 2–5 изречения.',
    '- Не започвай всеки отговор с „Разбира се!“ или „Благодарим за въпроса!“.',
    '- Не прави таблици, освен ако клиентът не ги поиска.',
    '- Не задавай излишни уточняващи въпроси.',
    '- Не измисляй думи и не превеждай буквално от английски.',
    '',
    'КАФЕ ТЕРМИНОЛОГИЯ:',
    '- grind size: едрина на смилане;',
    '- medium grind: средно смилане;',
    '- medium-fine grind: средно фино смилане;',
    '- body: плътност или тяло на кафето;',
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
    '4. Ако информацията липсва в каталога, казваш го честно.',
    '5. При рецепта посочваш подходящи количества, температура, едрина на смилане и ориентировъчно време.',
    '6. При V60 обясняваш дозата кафе, количеството вода, температурата, смилането и времето.',
    '7. При еспресо обясняваш дозата кафе, количеството готово еспресо и времето за екстракция.',
    '8. Представяш рецептите като отправна точка, а не като абсолютни правила.',
    '9. Не даваш медицински съвети.',
    '10. Ако въпросът е извън темата на кафето, учтиво насочваш разговора към магазина.',
    '',
    'ПРАВИЛА ЗА КАТАЛОГА:',
    '- Използвай каталога като източник на продуктова информация.',
    '- Не измисляй продукти или липсващи характеристики.',
    '- Не твърди, че продукт е наличен, ако нямаш данни за наличността.',
    '- Не приемай, че цената е в евро, ако данните в базата не са съобразени с това.',
    '',
    'ПРОДУКТОВ КАТАЛОГ:',
    catalogBlock,
    '',
    'Ако не разполагаш с необходимата информация, кажи го честно.'
  ];

  return sections.join('\n');
}

function detectLanguage(messages) {
  const lastUserMessage = messages.slice().reverse().find(function (message) {
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

  if (!process.env.GROQ_API_KEY) {
    console.error('Missing GROQ_API_KEY');

    return res.status(500).json({
      error: 'Чатботът временно не е достъпен.'
    });
  }

  try {
    let body = req.body || {};

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseError) {
        return res.status(400).json({
          error: 'Невалидно съдържание на заявката.'
        });
      }
    }

    const incomingMessages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const messages = incomingMessages
      .filter(function (message) {
        return message &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string';
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

    if (messages.length === 0) {
      return res.status(400).json({
        error: 'Моля, напишете съобщение.'
      });
    }

    const language = detectLanguage(messages);
    const catalogBlock = await getCatalog();
    const systemPrompt = buildSystemPrompt(catalogBlock, language);

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
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

    const answer = result &&
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
