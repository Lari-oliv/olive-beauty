# PRD - Estilização Moderna dos Gráficos do Dashboard

## 1. Visão Geral

Este documento descreve a atualização do estilo visual dos gráficos do dashboard administrativo para um design moderno, limpo e profissional, seguindo referências de dashboards contemporâneos com cores vibrantes e layout organizado.

## 2. Objetivos

- Modernizar a aparência visual dos gráficos do dashboard
- Melhorar a legibilidade e clareza das informações
- Manter consistência visual entre todos os gráficos
- Criar uma experiência visual agradável e profissional
- Otimizar o uso de espaço com labels compactos e elegantes

## 3. Escopo

### 3.1 Gráficos Afetados

1. **RevenueChart** (Receita ao Longo do Tempo) - Area Chart
2. **OrdersChart** (Pedidos ao Longo do Tempo) - Bar Chart
3. **OrdersByStatusChart** (Pedidos por Status) - Pie Chart
4. **SalesByCategoryChart** (Vendas por Categoria) - Bar Chart (múltiplas séries)

### 3.2 Componentes Não Afetados

- StatCards (mantêm estilo atual)
- TopProductsTable (mantém estilo atual)
- Outros componentes do dashboard

## 4. Especificações de Design

### 4.1 Paleta de Cores

#### Cores Principais
- **Cor Primária (Destaque)**: Verde #518E2C (`hsl(95 60% 35%)`)
  - Usada para elementos de destaque e séries principais
- **Cor Secundária**: Azul Ciano (`hsl(180 100% 50%)` ou `hsl(180 100% 60%)`)
  - Usada para séries secundárias e contraste
  - Alternativa: usar `--neon-blue` já definido no CSS

#### Aplicação de Cores
- **Area Chart**: Verde (destaque) + Azul (secundário)
- **Bar Chart (simples)**: Verde (destaque)
- **Bar Chart (múltiplas séries)**: Verde (destaque) + Azul (secundário)
- **Pie Chart**: Verde (destaque) + Azul (secundário) + variações para múltiplas fatias

### 4.2 Estilo Visual

#### Cores
- ✅ **Cores sólidas** (sem gradientes)
- ❌ **Sem efeitos de glow/neon**
- ✅ **Alta saturação** para contraste no dark mode
- ✅ **Consistência** entre todos os gráficos

#### Labels e Tipografia
- **Tamanho de fonte**: 12px para labels dos eixos
- **Labels compactos**: Não ocupar muito espaço visual
- **Formatação inteligente**: 
  - Valores monetários: `R$ 1.5k` ao invés de `R$ 1.500,00`
  - Datas: `15/01` ao invés de `15 de janeiro de 2024`
  - Percentuais: `25%` ao invés de `25.00%`
- **Posicionamento**: Labels dos eixos X podem ser rotacionados se necessário
- **Legendas**: Compactas, sem ocupar muito espaço

#### Eixos e Grid
- **Eixos**: Sem linhas de eixo (axisLine={false})
- **Ticks**: Sem linhas de tick (tickLine={false})
- **Grid**: Opcional, apenas se melhorar legibilidade
- **Cor dos eixos**: Usar `currentColor` para adaptar ao tema

#### Tooltips
- **Estilo**: Card com borda arredondada
- **Background**: `hsl(var(--card))`
- **Borda**: `hsl(var(--border))`
- **Formatação**: Valores formatados de forma clara e concisa

### 4.3 Especificações por Tipo de Gráfico

#### Area Chart (RevenueChart)
- **Tipo**: Area Chart com área preenchida
- **Cores**: Verde (destaque) + Azul (secundário) se houver múltiplas séries
- **Stroke**: 2px de largura
- **Fill**: Cor sólida com opacidade reduzida (0.3-0.4)
- **Curva**: `monotone` para suavidade

#### Bar Chart (OrdersChart)
- **Tipo**: Bar Chart vertical
- **Cor**: Verde (destaque)
- **Bordas arredondadas**: `radius={[4, 4, 0, 0]}` (topo arredondado)
- **Largura máxima**: `maxBarSize={40}`

#### Bar Chart Múltiplas Séries (SalesByCategoryChart)
- **Tipo**: Bar Chart com múltiplas séries
- **Cores**: Verde (destaque) + Azul (secundário)
- **Eixos Y**: Dois eixos se necessário (receita e quantidade)
- **Bordas arredondadas**: `radius={[4, 4, 0, 0]}`
- **Largura máxima**: `maxBarSize={40}`

#### Pie Chart (OrdersByStatusChart)
- **Tipo**: Pie Chart ou Donut Chart
- **Cores**: 
  - Verde para status principal (DELIVERED)
  - Azul para status secundário
  - Variações de verde/azul para outros status
- **Labels**: Percentuais dentro das fatias (se espaço permitir)
- **Legenda**: Externa, compacta

## 5. Requisitos Funcionais

### 5.1 RF-001: Aplicação de Cores
- **Descrição**: Todos os gráficos devem usar a paleta definida (verde + azul)
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Verde usado como cor de destaque
  - Azul usado como cor secundária
  - Consistência entre todos os gráficos

### 5.2 RF-002: Labels Compactos
- **Descrição**: Labels devem ser pequenos, bonitos e não ocupar muito espaço
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Fonte de 12px para labels dos eixos
  - Formatação inteligente de valores
  - Labels não sobrepõem elementos
  - Layout não fica confuso

### 5.3 RF-003: Cores Sólidas
- **Descrição**: Gráficos devem usar cores sólidas sem gradientes
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Sem gradientes nos fills
  - Cores sólidas com opacidade se necessário
  - Sem efeitos de glow/neon

### 5.4 RF-004: Consistência Visual
- **Descrição**: Todos os gráficos devem seguir o mesmo padrão visual
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Mesma paleta de cores
  - Mesmo estilo de labels
  - Mesmo estilo de tooltips
  - Mesmo estilo de eixos

### 5.5 RF-005: Responsividade
- **Descrição**: Gráficos devem ser responsivos e funcionar em diferentes tamanhos de tela
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Gráficos se adaptam ao container
  - Labels permanecem legíveis
  - Tooltips funcionam corretamente

## 6. Requisitos Não Funcionais

### 6.1 Performance
- **RNF-001**: Gráficos devem renderizar sem lag
- **RNF-002**: Animações devem ser suaves (se houver)

### 6.2 Acessibilidade
- **RNF-003**: Contraste adequado entre cores e fundo
- **RNF-004**: Tooltips acessíveis via hover
- **RNF-005**: Labels legíveis em diferentes tamanhos de tela

### 6.3 Manutenibilidade
- **RNF-006**: Cores devem usar variáveis CSS para fácil manutenção
- **RNF-007**: Código deve ser limpo e bem documentado

## 7. Especificações Técnicas

### 7.1 Cores CSS

```css
/* Cores para gráficos */
--chart-primary: 95 60% 35%; /* Verde #518E2C - Destaque */
--chart-secondary: 180 100% 50%; /* Azul Ciano - Secundário */

/* Ou usar as já existentes */
--primary: 95 60% 35%; /* Verde */
--neon-blue: 180 100% 50%; /* Azul */
```

### 7.2 Configuração Recharts

#### Eixos Padrão
```tsx
<XAxis
  style={{ fontSize: "12px", fill: "currentColor" }}
  axisLine={false}
  tickLine={false}
/>

<YAxis
  style={{ fontSize: "12px", fill: "currentColor" }}
  axisLine={false}
  tickLine={false}
/>
```

#### Tooltip Padrão
```tsx
<Tooltip
  contentStyle={{
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
  }}
/>
```

#### Cores Padrão
```tsx
const primaryColor = "hsl(var(--primary))"; // Verde
const secondaryColor = "hsl(var(--neon-blue))"; // Azul
```

### 7.3 Formatação de Valores

#### Valores Monetários
```tsx
const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}k`;
  }
  return `R$ ${value.toFixed(0)}`;
};
```

#### Datas
```tsx
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};
```

## 8. Implementação

### 8.1 Arquivos a Modificar

1. `frontend-admin/src/features/dashboard/components/RevenueChart.tsx`
2. `frontend-admin/src/features/dashboard/components/OrdersChart.tsx`
3. `frontend-admin/src/features/dashboard/components/OrdersByStatusChart.tsx`
4. `frontend-admin/src/features/dashboard/components/SalesByCategoryChart.tsx`

### 8.2 Ordem de Implementação

1. Atualizar paleta de cores no CSS (se necessário)
2. Atualizar RevenueChart (Area Chart)
3. Atualizar OrdersChart (Bar Chart)
4. Atualizar SalesByCategoryChart (Bar Chart múltiplas séries)
5. Atualizar OrdersByStatusChart (Pie Chart)
6. Testar todos os gráficos
7. Ajustar labels e formatação

## 9. Critérios de Aceitação

### 9.1 Visual
- ✅ Todos os gráficos usam verde como cor de destaque
- ✅ Todos os gráficos usam azul como cor secundária
- ✅ Cores são sólidas (sem gradientes)
- ✅ Sem efeitos de glow/neon
- ✅ Labels são pequenos e não ocupam muito espaço
- ✅ Layout não fica confuso

### 9.2 Funcional
- ✅ Todos os gráficos renderizam corretamente
- ✅ Tooltips funcionam corretamente
- ✅ Formatação de valores está correta
- ✅ Gráficos são responsivos

### 9.3 Consistência
- ✅ Todos os gráficos seguem o mesmo padrão visual
- ✅ Mesma paleta de cores em todos
- ✅ Mesmo estilo de labels
- ✅ Mesmo estilo de tooltips

## 10. Notas de Design

### 10.1 Inspiração
- Design baseado em dashboards modernos com cores vibrantes
- Foco em clareza e legibilidade
- Estilo limpo e profissional

### 10.2 Considerações
- Dark mode é o padrão do site
- Verde (#518E2C) é a cor primária da marca
- Azul ciano complementa bem o verde
- Labels compactos melhoram a experiência visual

## 11. Próximos Passos

1. Revisar e aprovar este PRD
2. Implementar as mudanças nos gráficos
3. Testar em diferentes tamanhos de tela
4. Ajustar conforme feedback
5. Documentar mudanças no código

