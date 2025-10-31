import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  // Função para detectar preferência inicial do sistema
  const getInitialTheme = (): boolean => {
    // Primeiro, verifica se há preferência salva no localStorage
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    
    // Se não há preferência salva, usa a preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  // Efeito para aplicar/remover a classe 'dark' no elemento html
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    // Persiste a preferência no localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  // Função para alternar entre dark e light mode
  const toggleDarkMode = () => {
    setIsDark(prevIsDark => !prevIsDark);
  };

  return { isDark, toggleDarkMode };
};