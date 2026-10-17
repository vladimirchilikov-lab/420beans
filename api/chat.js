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
```
