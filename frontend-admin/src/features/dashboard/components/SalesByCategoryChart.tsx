import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SalesByCategory } from "@/shared/types";
import { formatCurrency } from "@/shared/lib/utils";

interface SalesByCategoryChartProps {
  data: SalesByCategory[];
  isLoading?: boolean;
}

export function SalesByCategoryChart({
  data,
  isLoading,
}: SalesByCategoryChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Categoria</CardTitle>
          <CardDescription>Receita e quantidade por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Categoria</CardTitle>
          <CardDescription>Receita e quantidade por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Nenhum dado disponível</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const primaryColor = "hsl(var(--primary))";

  const chartData = data.map((item) => ({
    name: item.category.name,
    receita: item.revenue,
    quantidade: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Categoria</CardTitle>
        <CardDescription>Receita e quantidade por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              style={{ fontSize: "12px", fill: "currentColor" }}
              angle={-45}
              textAnchor="end"
              height={80}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              style={{ fontSize: "12px", fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              style={{ fontSize: "12px", fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "receita") {
                  return [formatCurrency(value), "Receita"];
                }
                return [value, "Quantidade"];
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="receita"
              name="Receita"
              fill={primaryColor}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              yAxisId="right"
              dataKey="quantidade"
              name="Quantidade"
              fill={primaryColor}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
