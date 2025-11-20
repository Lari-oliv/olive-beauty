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
import { TimeSeriesData } from "@/shared/types";

interface OrdersChartProps {
  data: TimeSeriesData[];
  isLoading?: boolean;
}

export function OrdersChart({ data, isLoading }: OrdersChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos ao Longo do Tempo</CardTitle>
          <CardDescription>Quantidade de pedidos por período</CardDescription>
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
          <CardTitle>Pedidos ao Longo do Tempo</CardTitle>
          <CardDescription>Quantidade de pedidos por período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Nenhum dado disponível</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const primaryColor = "hsl(var(--primary))";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos ao Longo do Tempo</CardTitle>
        <CardDescription>Quantidade de pedidos por período</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              style={{ fontSize: "12px", fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
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
              formatter={(value: number) => [`${value} pedidos`, "Quantidade"]}
              labelFormatter={(label) => `Data: ${formatDate(label)}`}
            />
            {/* <Legend /> */}
            <Bar
              dataKey="count"
              name="Pedidos"
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
