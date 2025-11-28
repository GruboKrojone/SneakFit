import i18n from "i18next";
import pl from "../pl.json";
import en from "../en.json";

i18n.init({
  lng: "en", // default lang

  supportedLngs: ["en", "pl", "de", "es"],
  defaultNS: "translation",

  resources: {
    en: {
      translation: en,
    },
    pl: {
      translation: pl,
    },
  },

  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
