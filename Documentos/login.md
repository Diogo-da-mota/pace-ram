# Prompt para LLM - Correção de Erros no Console Frontend

## Contexto do que JÁ FOI FEITO

### Problema Original
Sistema apresentava erro "usuário não autenticado" mesmo após login bem-sucedido com o email paceram@gmail.com.

### Correções Aplicadas no Backend (Supabase)

1. **Identificado problema de duplicação de usuários:**
   - Havia 2 registros com mesmo email mas IDs diferentes
   - ID `84d9496a-730a-45fa-afc9-567742919384` em public.usuarios (antigo)
   - ID `a72b31b5-764c-412a-953a-d9cde1e00680` em auth.users (correto)

2. **Sincronização corrigida:**
   - Deletado registro antigo de public.usuarios
   - Criado novo registro em public.usuarios com ID correto `a72b31b5-764c-412a-953a-d9cde1e00680`
   - Usuário mantido como tipo 'admin'
   - Tabelas auth.users e public.usuarios agora sincronizadas com mesmo ID

3. **RLS (Row Level Security) configurado:**
   - Habilitado RLS na tabela usuarios
   - Criadas 4 políticas simples: SELECT, INSERT, UPDATE, DELETE
   - Todas políticas usam condição `auth.uid() = id`
   - Políticas duplicadas removidas

4. **Trigger criado:**
   - Função handle_new_user() ativa
   - Trigger on_auth_user_created sincroniza novos usuários automaticamente

5. **Provider de autenticação confirmado:**
   - Usuário usa provider 'email' (não Google OAuth)
   - Login deve ser feito com signInWithPassword

### Status Atual do Banco de Dados
✅ Usuário sincronizado corretamente  
✅ RLS habilitado e funcionando  
✅ Políticas corretas aplicadas  
✅ Trigger de sincronização ativo  
✅ Provider: email (não Google)

---

## O QUE A LLM DEVE FAZER AGORA

### Objetivo
Analisar o código frontend e identificar/corrigir TODOS os erros que impedem a autenticação de funcionar corretamente.

### Arquivos que a LLM deve analisar

1. **Inicialização do Supabase Client**
   - Localização: Provavelmente `src/lib/supabase.ts` ou `src/utils/supabase.ts`
   - Verificar: Configuração correta do client, storage usado (localStorage vs sessionStorage)

2. **Hooks de Autenticação**
   - Arquivo: `useAuth.ts` ou `useAuthSession.ts`
   - Problema conhecido: Existem 2 hooks diferentes que podem estar conflitando
   - Verificar: Qual hook está sendo usado, gestão de sessão, listeners de auth state

3. **Componente de Login**
   - Verificar: Se está usando signInWithPassword (correto) ou signInWithOAuth (incorreto)
   - Verificar: Tratamento de erros, redirecionamento após login

4. **Componente Dashboard ou tela principal após login**
   - Arquivo: `Dashboard.tsx` (mencionado nos logs de erro)
   - Verificar: Proteção de rota, verificação de autenticação

5. **Logs de erro no console do navegador**
   - Erro mencionado: `fd_content.js` (extensão do navegador - IGNORAR)
   - Erro mencionado: "listener indicated an asynchronous response" (problema de Promise)
   - Verificar: Outros erros relacionados a autenticação

### Checklist de Verificação para a LLM

#### 1. Configuração do Supabase Client
- [ ] Está usando createClient corretamente?
- [ ] URL e ANON_KEY estão corretas?
- [ ] Está usando localStorage (recomendado) ou sessionStorage?
- [ ] persistSession está como true?
- [ ] autoRefreshToken está como true?
- [ ] Existe apenas UM client ou vários conflitando?

#### 2. Sistema de Autenticação
- [ ] Login está usando `signInWithPassword` (não `signInWithOAuth`)?
- [ ] Após login, está chamando `getSession()` para confirmar?
- [ ] Tem listener `onAuthStateChange` implementado?
- [ ] Sessão está sendo salva no estado global/contexto?
- [ ] Existe lógica de auto-login ao carregar a página?

#### 3. Verificação de Usuário Autenticado
- [ ] Como o sistema verifica se usuário está logado?
- [ ] Está usando `auth.uid()` ou `session?.user?.id`?
- [ ] Tem proteção de rotas implementada?
- [ ] Redirect funciona corretamente após login?

#### 4. Chamadas ao Banco de Dados
- [ ] Após login, sistema tenta ler dados do usuário da tabela `usuarios`?
- [ ] A query usa `.eq('id', session?.user?.id)` ou similar?
- [ ] Está tratando erros de RLS corretamente?

#### 5. Gestão de Estado
- [ ] Onde o user/session está sendo armazenado? (Context, Redux, Zustand, useState?)
- [ ] Estado persiste após refresh da página?
- [ ] Existe conflito entre diferentes métodos de storage?

#### 6. Erros Específicos a Investigar
- [ ] Erro "A listener indicated an asynchronous response" → Promise não resolvida corretamente
- [ ] Erro "Cannot read properties of undefined" → Objeto não existe quando esperado
- [ ] Erro "Usuário não autenticado" → RLS ou sessão não propagada

### Informações Técnicas para a LLM

**ID do usuário correto:** `a72b31b5-764c-412a-953a-d9cde1e00680`  
**Email:** paceram@gmail.com  
**Provider:** email (não Google)  
**Tipo:** admin  
**Tabela de usuários:** public.usuarios (NÃO perfis)  
**Método de login correto:** signInWithPassword

### O que a LLM deve entregar

1. **Lista de TODOS os problemas encontrados no código frontend**
   - Descrever cada problema de forma clara
   - Explicar por que cada problema impede a autenticação

2. **Instruções passo a passo de correção**
   - Qual arquivo modificar
   - O que exatamente mudar
   - Por que essa mudança resolve o problema

3. **Código corrigido para cada arquivo problemático**
   - Mostrar versão ANTES e DEPOIS
   - Comentar as mudanças importantes

4. **Checklist de validação pós-correção**
   - Como testar se a correção funcionou
   - O que deve aparecer no console após login bem-sucedido
   - Como confirmar que auth.uid() está funcionando

### Formato de Resposta Esperado da LLM

```
🔍 PROBLEMAS ENCONTRADOS:
1. [Descrição do problema 1]
2. [Descrição do problema 2]
...

🔧 CORREÇÕES NECESSÁRIAS:

ARQUIVO: [nome do arquivo]
PROBLEMA: [descrição]
SOLUÇÃO: [explicação da solução]
CÓDIGO CORRIGIDO: [código antes/depois]

[repetir para cada arquivo]

✅ VALIDAÇÃO:
Após aplicar as correções, execute no console:
[comandos de validação]

Resultado esperado:
[o que deve aparecer]
```

### Contexto Adicional

- **Sistema:** Pace Run Hub (plataforma para fotógrafos)
- **Stack:** React + TypeScript + Supabase
- **Erro atual:** "Usuário não autenticado" após login
- **Backend:** 100% corrigido e funcionando
- **Problema:** Está no frontend (código TypeScript/React)

### Logs de Console Disponíveis

```
Formulário de evento enviado: Object
keyboard-shortcuts.js:214 Extension keyboard shortcuts loaded
fd_content.js:33 Uncaught TypeError: Cannot read properties of undefined (reading 'AllowLocalHost')
dashboard:1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
Dashboard.tsx:339 Formulário de evento enviado: Object
```

**NOTA:** Erros de `keyboard-shortcuts.js` e `fd_content.js` são de extensões do navegador e devem ser IGNORADOS.

### Prioridade de Análise

1. **ALTA:** Configuração do Supabase client e hooks de auth
2. **ALTA:** Método de login (signInWithPassword vs signInWithOAuth)
3. **MÉDIA:** Gestão de estado e persistência de sessão
4. **MÉDIA:** Proteção de rotas e verificação de auth
5. **BAIXA:** Tratamento de erros e UX

### Perguntas que a LLM deve responder

1. O código está usando signInWithPassword ou signInWithOAuth?
2. Existe conflito entre useAuth e useAuthSession?
3. O client do Supabase está configurado corretamente?
4. A sessão está sendo persistida após login?
5. auth.uid() está sendo usado corretamente nas queries?
6. Existe algum código que assume provider 'google' quando deveria ser 'email'?
7. O sistema está tentando acessar a tabela errada (perfis vs usuarios)?

---

## INSTRUÇÕES FINAIS PARA O USUÁRIO

Após receber a resposta da LLM:
1. Aplicar TODAS as correções no código
2. Limpar cache do navegador completamente
3. Fazer novo login com email/senha
4. Executar comandos de validação no console
5. Reportar resultado

Se ainda houver erro após correções da LLM, fornecer:
- Logs completos do console após login
- Código dos arquivos corrigidos
- Resultado dos comandos de validação