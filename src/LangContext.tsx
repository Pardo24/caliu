import { createContext, useState, useContext, type ReactNode } from 'react';
import { tr, type Lang, type Tr } from './i18n';

type LangCtx = { lang: Lang; setLang: (l: Lang) => void; t: Tr };

const LangContext = createContext<LangCtx>({ lang: 'ca', setLang: () => {}, t: tr.ca });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang) || 'ca'
  );

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: tr[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}
