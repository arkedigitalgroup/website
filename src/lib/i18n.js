// src/lib/i18n.js
import { am } from '../locales/am';
import { en } from '../locales/en';

export const locales = { am, en };

export function translate(key, lang = 'am') {
  const dictionary = locales[lang] || locales.am;
  return dictionary[key] !== undefined ? dictionary[key] : key;
}
