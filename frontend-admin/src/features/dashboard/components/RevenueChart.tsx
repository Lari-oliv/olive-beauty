import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TimeSeriesData } from "@/shared/types";
import { formatCurrency } from "@/shared/lib/utils";

interface RevenueChartProps {
  data: TimeSeriesData[];
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receita ao Longo do Tempo</CardTitle>
          <CardDescription>Visualização da receita por período</CardDescription>
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
          <CardTitle>Receita ao Longo do Tempo</CardTitle>
          <CardDescription>Visualização da receita por período</CardDescription>
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
        <CardTitle>Receita ao Longo do Tempo</CardTitle>
        <CardDescription>Visualização da receita por período</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              style={{ fontSize: "12px", fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000) {
                  return `R$ ${(value / 1000).toFixed(0)}k`;
                }
                return `R$ ${value.toFixed(0)}`;
              }}
              style={{ fontSize: "12px", fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
              padding={{ top: 10, bottom: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Data: ${formatDate(label)}`}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={primaryColor}
              fill="url(#gradientPrimary)"
              strokeWidth={2}
              name="Receita"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
