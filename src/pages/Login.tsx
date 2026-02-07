import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuthSession();

  // Credenciais de cadastro predefinidas
  const SIGNUP_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com";

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Validação das credenciais predefinidas para cadastro
        if (email !== SIGNUP_EMAIL) {
          toast.error("Email não autorizado para cadastro");
          return;
        }
        
        /* Removido: validação de senha hardcoded no frontend */
        
        if (password !== confirmPassword) {
          toast.error("Senhas não coincidem");
          return;
        }
        
        // Realizar cadastro no Supabase
        const result = await signUp(email, password);
        
        if (result.success) {
          // Após cadastro bem-sucedido, fazer login automaticamente
          const loginResult = await signIn(email, password);
          if (loginResult.success) {
            navigate("/dashboard");
          }
        } else {
          toast.error(result.error || "Erro no cadastro");
        }
      } else {
        // Realizar login no Supabase
        const result = await signIn(email, password, rememberMe);
        
        if (result.success) {
          navigate("/dashboard");
        } else {
          toast.error(result.error || "Credenciais inválidas");
        }
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      toast.error("Erro interno do sistema");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRememberMe(false);
  };
/* favcon do navegador */
  return (
    <div className="dark min-h-screen bg-gray-1000 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <img 
            src="/logo-horizontal-branco.png" 
            alt="PACE RAM Logo" 
            className="h-20 w-auto mx-auto mb-8 filter brightness-0 invert"
          />
          <h1 className="text-2xl font-bold text-white mb-2">
            {isSignUp ? "Criar Conta" : ""}
          </h1>
        </div>

        <Card className="p-6 bg-gray-1000 shadow-intense border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200 font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "mínimo 6 caracteres" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200 font-medium">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-200 cursor-pointer">
                  Lembrar-me por 8 dias
                </Label>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || authLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || authLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUp ? "Cadastrando..." : "Entrando..."}
                </div>
              ) : (
                isSignUp ? "Cadastrar" : "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
            >
              Voltar ao site
            </Link>
          </div>  
        </Card>
      </div>
    </div>
  );
};

export default Login;