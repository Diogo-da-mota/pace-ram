import { Link, useLocation } from "react-router-dom";
import { Calendar, Sun, Moon } from "lucide-react";
import { useDarkMode } from '@/hooks/useDarkMode';

const Header = () => {
  const { isDark, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const hideLogin = true;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img 
            src="/logo-horizontal-branco.png" 
            alt="PACE RAM Logo" 
            className="h-10 w-auto transition-all duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Botões Mobile - Visível apenas em mobile, lado direito */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Botão Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="text-white transition-colors duration-200"
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-300" />
            )}
          </button>
          
          {/* Botão Calendário */}
          <Link 
            to="/calendario" 
            className="text-blue-400 transition-colors duration-200 font-medium text-xl flex items-center"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <Calendar className="w-5 h-5 text-blue-400 mr-2" />
            Calendário
          </Link>

          {/* Botão Portfolio (mobile) */}
          <Link 
            to="/portfolio" 
            className="text-blue-400 transition-colors duration-200 font-medium text-xl flex items-center"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Portfolio
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-white hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            Início
          </Link>
          <Link 
            to="/portfolio" 
            className="text-white hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            Portfolio
          </Link>
          
          {/* Botão Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="text-white transition-colors duration-200"
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-300" />
            )}
          </button>
          
          <Link 
            to="/calendario" 
            className="text-blue-400 transition-colors duração-200 font-medium text-xl flex items-center"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <Calendar className="w-5 h-5 text-blue-400 mr-2" />
            Calendário
          </Link>
        </nav>

      </div>
    </header>
  );
};

export default Header;