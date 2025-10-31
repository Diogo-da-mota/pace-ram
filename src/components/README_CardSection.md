# Sistema Centralizado de Cards - CardSection

## Visão Geral

O componente `CardSection` implementa um sistema centralizado para gerenciar os cards das seções "CALENDÁRIO Ano de 2025" e "Dúvidas Link externos". Ao modificar uma única configuração, ambas as seções são atualizadas automaticamente.

## Estrutura do Sistema

### 1. Configuração Centralizada (`CARD_CONFIG`)

```typescript
export const CARD_CONFIG = {
  container: {
    maxWidth: "max-w-4xl",     // Largura máxima do container
    margin: "mx-auto",         // Centralização horizontal
    spacing: "space-y-6"       // Espaçamento vertical entre cards
  },
  
  card: {
    borderRadius: "rounded-2xl",           // Bordas arredondadas
    padding: "p-6",                       // Padding interno
    background: "bg-card",                // Cor de fundo
    shadow: "shadow-card",                // Sombra padrão
    hoverShadow: "hover:shadow-hover",    // Sombra no hover
    border: "border border-border",       // Borda
    transition: "transition-all duration-500",  // Transições
    hoverScale: "hover:scale-[1.02]",     // Escala no hover
    animation: "animate-fade-in",         // Animação de entrada
    overflow: "overflow-hidden"           // Overflow
  },
  
  // ... outras configurações
};
```

### 2. Componente Reutilizável

```typescript
interface CardSectionProps {
  items: CardItem[];                    // Array de itens para renderizar
  animationDelayMultiplier?: number;    // Multiplicador do delay de animação
}

const CardSection: React.FC<CardSectionProps> = ({ 
  items, 
  animationDelayMultiplier = 0.15 
}) => {
  // Renderização dos cards baseada na configuração centralizada
};
```

## Como Usar

### 1. Importar o Componente

```typescript
import CardSection from "@/components/CardSection";
```

### 2. Usar nas Seções

```typescript
// Seção Calendário
<CardSection 
  items={eventosParaExibir} 
  animationDelayMultiplier={0.15} 
/>

// Seção Dúvidas Link externos
<CardSection 
  items={outrosParaExibir} 
  animationDelayMultiplier={0.2} 
/>
```

## Modificando o Visual dos Cards

Para alterar o visual de ambas as seções simultaneamente, modifique o objeto `CARD_CONFIG` no arquivo `CardSection.tsx`:

### Exemplos de Modificações

#### 1. Alterar Largura dos Cards
```typescript
container: {
  maxWidth: "max-w-6xl",  // Mudança de max-w-4xl para max-w-6xl
  margin: "mx-auto",
  spacing: "space-y-6"
}
```

#### 2. Alterar Bordas
```typescript
card: {
  borderRadius: "rounded-3xl",  // Mudança de rounded-2xl para rounded-3xl
  // ... outras propriedades
}
```

#### 3. Alterar Padding
```typescript
card: {
  padding: "p-8",  // Mudança de p-6 para p-8
  // ... outras propriedades
}
```

#### 4. Alterar Espaçamento Entre Cards
```typescript
container: {
  maxWidth: "max-w-4xl",
  margin: "mx-auto",
  spacing: "space-y-8"  // Mudança de space-y-6 para space-y-8
}
```

## Vantagens do Sistema Centralizado

1. **Consistência**: Garante que ambas as seções tenham sempre o mesmo visual
2. **Manutenibilidade**: Uma única alteração atualiza ambas as seções
3. **Reutilização**: O componente pode ser usado em outras partes da aplicação
4. **Flexibilidade**: Permite customização através de props
5. **Organização**: Separa a lógica visual da lógica de negócio

## Propriedades Configuráveis

- **Largura do container**: `container.maxWidth`
- **Espaçamento entre cards**: `container.spacing`
- **Bordas dos cards**: `card.borderRadius`
- **Padding interno**: `card.padding`
- **Cores e sombras**: `card.background`, `card.shadow`, `card.hoverShadow`
- **Animações**: `card.transition`, `card.hoverScale`, `card.animation`
- **Tipografia**: `title.fontSize`, `title.fontWeight`, `title.color`

## Estrutura de Dados

Os itens devem seguir a interface:

```typescript
interface CardItem {
  id: string;           // Identificador único
  titulo: string;       // Título do card
  link_externo?: string; // Link externo (opcional)
}
```

## Funcionalidades Mantidas

- ✅ Links externos funcionais
- ✅ Animações de entrada escalonadas
- ✅ Efeitos de hover (escala, brilho, cores)
- ✅ Responsividade
- ✅ Acessibilidade (target="_blank", rel="noopener noreferrer")