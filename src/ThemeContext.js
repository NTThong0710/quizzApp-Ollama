import React, { createContext, useContext, useState } from 'react';

// Tạo Context
const ThemeContext = createContext();

// Hook để truy cập context
export const useTheme = () => useContext(ThemeContext);

// Tạo Provider cho context
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');  // Mặc định là 'light'
  
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
