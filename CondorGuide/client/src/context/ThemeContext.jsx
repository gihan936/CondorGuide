import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const storedTheme = localStorage.getItem('theme') || 'light';
  const storedFontSize = localStorage.getItem('fontSize') || 'medium';
  const [theme, setTheme] = useState(storedTheme);
  const [fontSize, setFontSize] = useState(storedFontSize);

  useEffect(() => {
    document.body.className = `${theme} font-${fontSize}`;
    localStorage.setItem('theme', theme);
  }, [theme, fontSize]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  
  const changeFontSize = (size) => setFontSize(size);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontSize, changeFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};
export default ThemeProvider;