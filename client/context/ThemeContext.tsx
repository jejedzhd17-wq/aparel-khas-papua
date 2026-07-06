import React, { createContext, useContext, useEffect } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Force light mode always — remove dark class and clear saved preference
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('noken-theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark: false, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
