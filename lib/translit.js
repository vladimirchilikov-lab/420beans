// Транслитерация на български имена към латиница.
// Използва се, когато в базата няма английско име на продукт.
const COUNTRY_NAMES = {
  'Етиопия': 'Ethiopia',
  'Бразилия': 'Brazil',
  'Колумбия': 'Colombia',
  'Кения': 'Kenya',
  'Гватемала': 'Guatemala',
  'Хондурас': 'Honduras',
  'Коста Рика': 'Costa Rica',
  'Салвадор': 'El Salvador',
  'Никарагуа': 'Nicaragua',
  'Панама': 'Panama',
  'Перу': 'Peru',
  'Еквадор': 'Ecuador',
  'Боливия': 'Bolivia',
  'Мексико': 'Mexico',
  'Руанда': 'Rwanda',
  'Бурунди': 'Burundi',
  'Танзания': 'Tanzania',
  'Уганда': 'Uganda',
  'Индонезия': 'Indonesia',
  'Виетнам': 'Vietnam',
  'Индия': 'India',
  'Йемен': 'Yemen',
  'Ямайка': 'Jamaica',
  'Доминикана': 'Dominican Republic',
  'Китай': 'China',
  'Тайланд': 'Thailand',
  'Филипини': 'Philippines',
  'Уила': 'Huila',
  'Джима': 'Jimma',
  'Некери': 'Nyeri'
};

const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's',
  т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht',
  ъ: 'a', ь: 'y', ю: 'yu', я: 'ya'
};

function toLatin(value) {
  let text = String(value === null || value === undefined ? '' : value);

  if (!/[а-яА-Я]/.test(text)) {
    return text;
  }

  Object.keys(COUNTRY_NAMES).forEach(function (country) {
    text = text.split(country).join(COUNTRY_NAMES[country]);
  });

  return text.replace(/[а-яА-Я]/g, function (character) {
    const latin = CYRILLIC_TO_LATIN[character.toLowerCase()];

    if (!latin) {
      return character;
    }

    return character === character.toLowerCase()
      ? latin
      : latin.charAt(0).toUpperCase() + latin.slice(1);
  });
}

module.exports = { toLatin };
