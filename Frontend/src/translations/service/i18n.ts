import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  getLocaleFromPath,
  isDevMode,
  DEV_MODE,
} from "./TranslationService.ts";

import enTranslations from "../en.json";
import plTranslations from "../pl.json";

const currentLocale = getLocaleFromPath();
const devModeActive = isDevMode();

i18n.use(initReactI18next).init({
  resources: devModeActive
    ? {
        dev: { translation: {} },
      }
    : {
        en: { translation: enTranslations },
        pl: { translation: plTranslations },
      },
  lng: devModeActive ? DEV_MODE : currentLocale,
  fallbackLng: devModeActive ? false : "en",

  returnNull: false,
  returnEmptyString: false,

  interpolation: {
    escapeValue: false,
  },

  ...(devModeActive && {
    parseMissingKeyHandler: (key: string) => `[${key}]`,
    saveMissing: true,
  }),
});

export default i18n;
