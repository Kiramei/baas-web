import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '@/assets/locales/en.json';
import zhTranslations from '@/assets/locales/zh.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      zh: { translation: zhTranslations },
    },
    lng: 'zh', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  }).then(
    () => {

    }
);
