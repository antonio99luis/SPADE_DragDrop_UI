import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';

const I18nContext = createContext({
  lang: 'es',
  setLanguage: () => {},
  t: (key, fallback) => fallback ?? key,
});

function get(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('ui.lang') || 'es');

  // Sync with storage and custom events
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'ui.lang' && e.newValue) {
        setLang(e.newValue);
      }
    };
    const onCustom = (e) => {
      if (e.detail && e.detail.lang) {
        setLang(e.detail.lang);
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('ui-lang-changed', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ui-lang-changed', onCustom);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('ui.lang', lang); } catch {}
    document.documentElement.setAttribute('data-ui-lang', lang);
  }, [lang]);

  const t = useCallback((key, fallback) => {
    const dict = translations[lang] || translations.es || {};
    const value = get(dict, key);
    return value !== undefined ? value : (fallback ?? key);
  }, [lang]);

  const setLanguage = useCallback((newLang) => {
    setLang(newLang);
    try { localStorage.setItem('ui.lang', newLang); } catch {}
    window.dispatchEvent(new CustomEvent('ui-lang-changed', { detail: { lang: newLang } }));
  }, []);

  const value = useMemo(() => ({ lang, setLanguage, t }), [lang, setLanguage, t]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
