# PRD - Preview Automático de Links (Versão Minimalista)

## 1. Visão Geral

**Objetivo:** Implementar preview automático de links com código ultra-enxuto (<100 linhas totais)

**Problema:** Usuários precisam preencher manualmente título e imagem quando já existem metadados na URL do evento

**Solução:** Auto-extração de metadados básicos com implementação minimalista e funcional

## 2. Requisitos Funcionais Mínimos

### 2.1 Funcionalidades Essenciais
- **Detecção de URL:** Validar URL no campo "Link do Evento" com regex simples
- **Extração de Metadados:** Buscar apenas og:title e og:image via fetch direto
- **Auto-preenchimento:** Preencher automaticamente campos "Nome" e "URL da Imagem"
- **Preview Visual:** Mostrar card simples com título e imagem extraídos

### 2.2 Fluxo Simplificado
1. Usuário cola URL no campo "Link do Evento"
2. Sistema valida URL (regex básico)
3. Após 500ms (debounce), faz fetch da página
4. Extrai og:title e og:image com regex
5. Auto-preenche campos relacionados
6. Exibe preview inline no formulário

## 3. Implementação Ultra-Enxuta

### 3.1 Arquitetura Minimalista
```
📁 Estrutura de Código (Total: ~90 linhas)
├── hooks/useLinkPreview.ts (50 linhas)
├── components/PreviewCard.tsx (25 linhas)
└── Dashboard.tsx (15 linhas adicionais)
```

### 3.2 Componentes Mínimos

**Hook useLinkPreview:**
- Debounce com setTimeout simples
- Fetch direto sem bibliotecas externas
- Regex para extrair og:title e og:image
- Estados: loading, data, error

**Componente PreviewCard:**
- Card simples com imagem e título
- Sem animações complexas
- Estilização básica com Tailwind existente

**Integração Dashboard:**
- useEffect para monitorar campo URL
- Auto-preenchimento direto nos estados
- Preview inline abaixo do formulário

### 3.3 Código de Referência

**useLinkPreview.ts (50 linhas):**
```typescript
const useLinkPreview = (url: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!url || !url.match(/^https?:\/\//)) return;
    
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        const result = await response.json();
        const html = result.contents;
        
        const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] || 
                     html.match(/<title>([^<]*)</)?.[1];
        const image = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1];
        
        setData({ title, image });
      } catch (error) {
        setData(null);
      }
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [url]);
  
  return { data, loading };
};
```

**PreviewCard.tsx (25 linhas):**
```tsx
const PreviewCard = ({ title, image }: { title?: string; image?: string }) => {
  if (!title && !image) return null;
  
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      {image && (
        <img src={image} alt={title} className="w-full h-32 object-cover rounded mb-2" />
      )}
      {title && (
        <h3 className="font-medium text-sm">{title}</h3>
      )}
    </div>
  );
};
```

## 4. Limitações Aceitas

### 4.1 Simplificações Técnicas
- **Metadados:** Apenas og:title e og:image (sem description)
- **CORS:** Uso de proxy público (allorigins.win)
- **Cache:** Sem armazenamento de resultados
- **Validação:** Regex básico para URLs
- **Erro:** Fallback silencioso para placeholder

### 4.2 UX Simplificado
- **Preview:** Card básico sem animações
- **Loading:** Indicador simples
- **Responsividade:** Layout básico
- **Acessibilidade:** Mínima necessária

## 5. Critérios de Sucesso

### 5.1 Funcionalidade
- ✅ Auto-preenchimento funcionando
- ✅ Preview visual básico
- ✅ Debounce operacional
- ✅ Tratamento de erro silencioso

### 5.2 Código
- ✅ Total <100 linhas
- ✅ Sem dependências externas
- ✅ Código limpo e legível
- ✅ Integração não-invasiva

### 5.3 Performance
- ✅ Debounce evita requests excessivos
- ✅ Fetch direto sem overhead
- ✅ Regex eficiente
- ✅ Componente leve

## 6. Implementação Rápida

### 6.1 Ordem de Desenvolvimento
1. **Hook useLinkPreview** (30 min)
2. **Componente PreviewCard** (15 min)
3. **Integração Dashboard** (15 min)
4. **Testes básicos** (15 min)

**Total estimado:** 75 minutos

### 6.2 Validação
- Testar com URLs reais de eventos
- Verificar auto-preenchimento
- Confirmar preview visual
- Validar tratamento de erros

## 7. Evolução Futura

Caso necessário expandir:
- Adicionar og:description
- Implementar cache local
- Melhorar tratamento de CORS
- Adicionar animações
- Expandir validação de URLs

---

**Conclusão:** Esta versão minimalista entrega 80% do valor com 20% do código, priorizando funcionalidade essencial sobre recursos avançados.