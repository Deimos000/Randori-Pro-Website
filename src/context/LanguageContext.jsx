import React, { createContext, useState, useContext } from 'react';
import en from '../content/en.json';
import de from '../content/de.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const content = lang === 'en' ? en : de;

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'de' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ content, toggleLanguage, lang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useText = () => useContext(LanguageContext);