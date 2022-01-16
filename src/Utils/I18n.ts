import i18n from "i18next";
//import LanguageDetector from "i18next-browser-languagedetector"
import CookieManager from './CookiesManager';
import english from "../Translations/english.json";
import arabic from "../Translations/arabic.json";
i18n.init({
    lng: CookieManager.getLocale() ?? 'en',
    resources: {
        en: english,
        ar: arabic
    },
    lowerCaseLng:true,
    ns: ["common","header"],
    defaultNS: "common",
    keySeparator: false,
    interpolation:{
        escapeValue: false,
        formatSeparator: ","
    },
})


export default i18n;



