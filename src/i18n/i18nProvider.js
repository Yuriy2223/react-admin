import polyglotI18nProvider from 'ra-i18n-polyglot';
import eng from 'ra-language-english';
import ua from 'ra-language-ukrainian';

import merge from 'lodash/merge';
import {uaCustomMessages} from "./translations/ua";
import {engCustomMessages} from "./translations/eng";

const uaMessages = merge(ua, uaCustomMessages);
const engMessages = merge(eng, engCustomMessages);

const translations = {
    en: engMessages,
    ua: uaMessages,
};

export const i18nProvider = polyglotI18nProvider(
    locale => translations[locale],
    'ua',
    [
        {locale: 'en', name: 'English'},
        {locale: 'ua', name: 'Українська'},
    ],
);
