```javascript
const { createClient } = require('@supabase/supabase-js');

const GROQ_MODEL = 'openai/gpt-oss-20b';
const MAX_TURNS = 8;
const MAX_MSG_LEN = 600;
const MAX_TOKENS = 500;

function buildCatalogBlock(products) {
  if (!products || !products.length) {
    return 'Каталогът в момента е празен. Не препоръчвай конкретни продукти.';
  }

  return products
    .map((p) => {
      const notes = p.description || p.notes || '';
      const roast =
        typeof p.roast === 'number' ? String(p.roast) + '/100' : '';

      return (
        '- "' +
        p.name +
        '" (' +
        (p.category || 'кафе') +
        ')' +
        (roast ? ' · степен на изпичане ' + roast : '') +
        (notes ? ' · описание: ' + notes : '') +
        (p.price != null ? ' · цена: ' + p.price + ' €' : '')
      );
    })
    .join('\n');
}

function buildSystemPrompt(catalogBlock, lang) {
  const langInstruction =
    lang === 'en'
      ? 'Reply in natural, fluent English. If the customer writes in another language, reply in that language.'
      : 'Отговаряй на естествен, граматически правилен съвременен български език. Ако клиентът пише на друг език, отговори на неговия език. Не превеждай буквално от английски.';

  return `Ти си Бийн — консултант по специално кафе в онлайн магазина 420 Beans.

${langInstruction}

НАЧИН НА ОБЩУВАНЕ:
- Говориш като компетентен и приятелски настроен бариста.
- Използваш естествени, разговорни изречения, които звучат като написани от българин.
- По подразбиране се обръщаш към клиента на „ти“. Ако клиентът предпочита официалното „Вие“, съобрази се.
- Отговаряш кратко и конкретно — обикновено в 2–5 изречения.
- При рецепти и няколко препоръки използваш кратък списък.
- Не правиш таблици, освен ако клиентът изрично не ги поиска.
- Не започваш всеки отговор с „Разбира се!“, „Благодарим за въпроса!“ или „С удоволствие ще ви помогна!“.
- Не повтаряш въпроса на клиента.
- Не завършваш всеки отговор с въпрос.
- Не прекаляваш с емоджитата и рекламните фрази.
- Не използваш измислени думи или буквални преводи от английски.
- Ако не си сигурен в даден термин, обясни го с по-прости думи.

ПРАВИЛНА ТЕРМИНОЛОГИЯ:
- grind size: едрина на смилане;
- medium grind: средно смилане;
- medium-fine grind: средно фино смилане;
- body: плътност на кафето или тяло;
- brew time: време за приготвяне;
- pouring technique: техника на наливане;
- drawdown: оттичане на водата през кафето;
- extraction: екстракция;
- coffee-to-water ratio: съотношение кафе/вода;
- espresso yield: количество готово еспресо в чашата;
- acidity: киселинност;
- tasting notes: вкусови нотки;
- roast level: степен на изпичане;
- grind finer: смели по-фино;
- grind coarser: смели по-едро.

Не използвай неестествени изрази като „полу-гъста смиля“, „бързо пресуване“, „поддържане на дебелина“ или „волумен на изхода“.

При V60 и други филтърни методи говори за количеството кафе и вода, температурата, едрината на смилане, техниката на наливане и общото време за приготвяне.

При еспресо говори за дозата смляно кафе, количеството готово кафе в чашата, времето за екстракция и настройката на смилане. Не смесвай терминологията на различните методи.

ТВОИТЕ ЗАДАЧИ:
1. Помагаш на клиентите да изберат кафе според вкусовите им предпочитания, плътността, киселинността и начина на приготвяне.
2. Препоръчваш само реални продукти от каталога по-долу и изписваш имената им точно.
3. Даваш практични рецепти за V60, френска преса, moka pot, AeroPress, еспресо и cold brew.
4. Ако методът на приготвяне не е посочен и е важен за препоръката, задаваш един кратък уточняващ въпрос.
5. Ако клиентът вече е посочил метода, не го питаш повторно.
6. Ако продукт липсва от каталога, не твърдиш, че се предлага. Можеш да предложиш подходяща налична алтернатива.
7. Не измисляш цени, наличности, произход, обработка или вкусови характеристики.
8. Не твърдиш, че лично си дегустирал дадено кафе.
9. Ако информацията не е достатъчна, казваш го открито.
10. Не даваш медицински съвети. При въпроси за здравословни състояния и кофеин насочваш клиента към медицински специалист.
11. Ако клиентът пита за тема извън кафето и магазина, учтиво обясняваш, че си специализиран в кафето.

ПРЕПОРЪКИ ЗА ПРИГОТВЯНЕ:
- Давай подходящи начални настройки, а не абсолютни правила.
- При филтърно кафе посочвай дозата, водата, температурата, смилането и ориентировъчното време, когато е уместно.
- При еспресо посочвай дозата, количеството готово кафе и ориентировъчното време, когато е уместно.
- Ако кафето е прекалено горчиво, можеш да предложиш малко по-едро смилане или по-ниска температура.
- Ако кафето има вкус на недоекстракция, можеш да предложиш малко по-фино смилане или по-висока температура.
- Не приемай, че всяка киселинност е дефект. При специалното кафе тя може да е желана част от вкуса.
- Не добавяй ненужни технически подробности, когато клиентът иска кратък съвет.

ВКУСОВИ ПРОФИЛИ:
- Описвай кафето чрез потвърдените данни в каталога.
- Не измисляй плодови, шоколадови, ядкови или други вкусови нотки.
- Разграничавай потвърдените характеристики от общите си препоръки за приготвяне.

ЦЕНИ:
- Валутата на сайта е евро (€).
- Използвай цените от каталога, когато са налични.
- Не измисляй цени за различни разфасовки.
- Не обещавай доставка или наличност без потвърдена информация.

ТЕКУЩ ПРОДУКТОВ КАТАЛОГ:
${catalogBlock}

Използвай каталога като източник на информация за продуктите. Ако дадена информация липсва, не я измисляй.`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Missing GROQ_API_KEY environment variable');
    }

    const { messages, lang } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing messages' });
    }

    const cleanMessages = messages
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string'
      )
      .slice(-MAX_TURNS)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, MAX_MSG_LEN),
      }));

    if (
      !cleanMessages.length ||
      cleanMessages[cleanMessages.length - 1].role !== 'user'
    ) {
      return res.status(400).json({
        error: 'Last message must be from the user',
      });
    }

    let products = [];

    if (
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_KEY
    ) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );

      const { data, error } = await supabase
        .from('products')
        .select('name, description, price, category')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase product query error:', error.message);
      } else {
        products = data || [];
      }
    }

    const catalogBlock = buildCatalogBlock(products);
    const systemPrompt = buildSystemPrompt(
      catalogBlock,
      lang === 'en' ? 'en' : 'bg'
    );

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.GROQ_API_KEY,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: MAX_TOKENS,
          temperature: 0.5,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...cleanMessages,
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();

      console.error(
        'Groq API error:',
        response.status,
        errText
      );

      throw new Error('AI service error ' + response.status);
    }

    const data = await response.json();
    const reply =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      typeof data.choices[0].message.content === 'string'
        ? data.choices[0].message.content.trim()
        : '';

    return res.status(200).json({
      reply:
        reply ||
        'Извинявай, не успях да формулирам отговор. Опитай отново.',
    });
  } catch (err) {
    console.error('Chat error:', err);

    return res.status(500).json({
      error: 'Failed to get a response',
      detail: 'В момента чатът не е достъпен. Опитай отново след малко.',
    });
  }
};
```
