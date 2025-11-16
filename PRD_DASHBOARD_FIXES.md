# PRD: Correções no Dashboard Admin

## Problema Identificado

O dashboard admin apresenta dois problemas principais:
1. **Total de Usuários não aparece** - O card mostra 0 ou não renderiza corretamente
2. **Gráfico de Pedidos ao Longo do Tempo não aparece** - O gráfico não exibe dados

## Análise Técnica

### Problema 1: Total de Usuários

**Causa Raiz:**
- O backend (`GetDashboardStatsUseCase`) retorna o campo `totalCustomers` (linha 26)
- O frontend (`DashboardStats` type) espera o campo `totalUsers` (linha 91 de `types/index.ts`)
- Há uma incompatibilidade de nomes entre backend e frontend

**Arquivos Envolvidos:**
- Backend: `backend/src/features/dashboard/use-cases/GetDashboardStatsUseCase.ts` (linha 26)
- Frontend: `frontend-admin/src/shared/types/index.ts` (linha 91)
- Frontend: `frontend-admin/src/features/dashboard/pages/DashboardPage.tsx` (linha 211)

**Solução:**
- Opção 1 (Recomendada): Alterar o backend para retornar `totalUsers` ao invés de `totalCustomers`
- Opção 2: Alterar o frontend para usar `totalCustomers` ao invés de `totalUsers`

### Problema 2: Gráfico de Pedidos ao Longo do Tempo

**Causa Raiz:**
- O backend (`GetOrdersOverTimeUseCase`) retorna um objeto com estrutura:
  ```typescript
  {
    data: [{ date: string, orders: number }],
    total: number,
    totalBefore: number,
    totalAccumulated: number
  }
  ```
- O controller (`DashboardController.getOrdersOverTime`) retorna o objeto inteiro (linha 70)
- O frontend espera um array direto de `TimeSeriesData[]` onde cada item tem `{ date: string, count: number }`
- Além disso, o backend retorna `orders` mas o frontend espera `count` no gráfico

**Arquivos Envolvidos:**
- Backend: `backend/src/features/dashboard/use-cases/GetOrdersOverTimeUseCase.ts` (linhas 51-54)
- Backend: `backend/src/features/dashboard/controllers/DashboardController.ts` (linha 67-70)
- Frontend: `frontend-admin/src/api/endpoints/dashboard.ts` (linha 43-53)
- Frontend: `frontend-admin/src/features/dashboard/components/OrdersChart.tsx` (linha 79 - usa `dataKey="count"`)

**Solução:**
1. Modificar o controller para retornar apenas o array `data` do use case
2. Transformar o campo `orders` para `count` no array retornado
3. Ou modificar o use case para retornar diretamente o array formatado

## Requisitos de Implementação

### Tarefa 1: Corrigir Total de Usuários

**Backend - Alterar `GetDashboardStatsUseCase.ts`:**
- Mudar o campo `totalCustomers` para `totalUsers` no objeto de retorno (linha 26)
- Manter a lógica de contagem (contar usuários com role 'USER')

**Arquivo:** `backend/src/features/dashboard/use-cases/GetDashboardStatsUseCase.ts`
```typescript
// ANTES:
return {
  totalRevenue: totalRevenue._sum.total || 0,
  totalOrders,
  totalCustomers,  // ❌
  totalProducts,
};

// DEPOIS:
return {
  totalRevenue: totalRevenue._sum.total || 0,
  totalOrders,
  totalUsers: totalCustomers,  // ✅
  totalProducts,
};
```

### Tarefa 2: Corrigir Gráfico de Pedidos

**Backend - Opção A: Modificar o Controller (Recomendada)**

**Arquivo:** `backend/src/features/dashboard/controllers/DashboardController.ts`
- Modificar o método `getOrdersOverTime` para extrair apenas o array `data` e transformar `orders` em `count`

```typescript
// ANTES:
async getOrdersOverTime(req: Request, res: Response) {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const data = await getOrdersOverTimeUseCase.execute(days);
    return res.json({
      status: 'success',
      data,  // ❌ Retorna objeto inteiro
    });
  } catch (error) {
    // ...
  }
}

// DEPOIS:
async getOrdersOverTime(req: Request, res: Response) {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const result = await getOrdersOverTimeUseCase.execute(days);
    // Transformar array: orders -> count
    const data = result.data.map(item => ({
      date: item.date,
      count: item.orders  // ✅ Transformar orders em count
    }));
    return res.json({
      status: 'success',
      data,  // ✅ Retorna apenas o array
    });
  } catch (error) {
    // ...
  }
}
```

**Backend - Opção B: Modificar o Use Case**

**Arquivo:** `backend/src/features/dashboard/use-cases/GetOrdersOverTimeUseCase.ts`
- Modificar o retorno para retornar diretamente o array formatado com `count` ao invés de `orders`

```typescript
// ANTES:
data.push({
  date: dateStr,
  orders: ordersByDay[dateStr] || 0,  // ❌
});

return {
  data,
  total: totalOrders,
  totalBefore: totalBeforePeriod,
  totalAccumulated: totalBeforePeriod + totalOrders,
};

// DEPOIS:
data.push({
  date: dateStr,
  count: ordersByDay[dateStr] || 0,  // ✅
});

// Retornar apenas o array (ou manter estrutura se outros endpoints precisarem)
return {
  data,
  total: totalOrders,
  totalBefore: totalBeforePeriod,
  totalAccumulated: totalBeforePeriod + totalOrders,
};
```

E no controller, extrair apenas o `data`:
```typescript
const result = await getOrdersOverTimeUseCase.execute(days);
return res.json({
  status: 'success',
  data: result.data,  // ✅
});
```

## Testes Necessários

### Teste 1: Total de Usuários
1. Verificar que o endpoint `/dashboard/stats` retorna `totalUsers` (não `totalCustomers`)
2. Verificar que o card "Total de Usuários" exibe o número correto no frontend
3. Testar com 0 usuários, 1 usuário e múltiplos usuários

### Teste 2: Gráfico de Pedidos
1. Verificar que o endpoint `/dashboard/orders-over-time?days=7` retorna um array de objetos com `{ date, count }`
2. Verificar que o gráfico renderiza corretamente no frontend
3. Testar com 0 pedidos, poucos pedidos e muitos pedidos
4. Testar com diferentes períodos (7, 30, 90 dias)

## Impacto

### Arquivos a Modificar
- `backend/src/features/dashboard/use-cases/GetDashboardStatsUseCase.ts` (1 linha)
- `backend/src/features/dashboard/controllers/DashboardController.ts` (método `getOrdersOverTime`)
- Opcionalmente: `backend/src/features/dashboard/use-cases/GetOrdersOverTimeUseCase.ts` (se escolher Opção B)

### Compatibilidade
- ✅ Não quebra compatibilidade com outros endpoints
- ✅ Não requer mudanças no frontend (apenas backend)
- ✅ Não requer mudanças no banco de dados

## Prioridade

**ALTA** - Funcionalidades críticas do dashboard não estão funcionando

## Estimativa

- **Tarefa 1 (Total de Usuários):** 5 minutos
- **Tarefa 2 (Gráfico de Pedidos):** 15 minutos
- **Testes:** 10 minutos
- **Total:** ~30 minutos

