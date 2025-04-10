import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../Language/en.json";
import hi from "../Language/hi.json";
import ka from "../Language/ka.json";
import ja from "../Language/ja.json";
import de from "../Language/de.json";
import es from "../Language/es.json";
import fr from "../Language/fr.json";
import ru from "../Language/ru.json";
import my from "../Language/my.json";
import id from "../Language/id.json";
import tr from "../Language/tr.json";
import zh from "../Language/zh.json";
import zh_HK from "../Language/zh_HK.json";
import vi from "../Language/vi.json";
import sw from "../Language/sw.json";
import nl from "../Language/nl.json";
import ko from "../Language/ko.json";
import pt from "../Language/pt.json";
import bn from "../Language/bn.json";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: en,
    hi: hi,
    ka: ka,
    ja: ja,
    de: de,
    es: es,
    fr: fr,
    ru: ru,
    my: my,
    id: id,
    tr:tr,
    zh:zh,
    zh_HK:zh_HK,
    vi:vi,
    sw:sw,
    nl:nl,
    ko:ko,
    pt:pt,
    bn:bn
  },
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
