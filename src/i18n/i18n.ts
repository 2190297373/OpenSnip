import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

// Initialize i18n with two languages: Chinese (zh-CN) and English (en)
i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      en: { translation: en },
    },
    fallbackLng: 'zh-CN',
    lng: 'zh-CN', // default language
    supportedLngs: ['zh-CN', 'en'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
