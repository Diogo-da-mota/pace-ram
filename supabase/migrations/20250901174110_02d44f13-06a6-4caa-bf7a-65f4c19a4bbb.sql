-- Confirmar o usuário existente para permitir login
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  confirmed_at = now()
WHERE email = 'paceram@gmail.com';