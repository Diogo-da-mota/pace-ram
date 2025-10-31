import React from 'react';
import { AuthSessionContext, useAuthSessionProvider } from '@/hooks/useAuthSession';

interface AuthSessionProviderProps {
  children: React.ReactNode;
}

export const AuthSessionProvider: React.FC<AuthSessionProviderProps> = ({ 
  children
}) => {
  const auth = useAuthSessionProvider();

  return (
    <AuthSessionContext.Provider value={auth}>
      {children}
    </AuthSessionContext.Provider>
  );
};

export default AuthSessionProvider;