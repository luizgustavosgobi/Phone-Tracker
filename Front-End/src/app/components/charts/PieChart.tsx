"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";

type ChartItem = {
  name: string;
  value: number;
};

const COLORS = ["#dd2a56", "#ffe156", "#4cb5ae"];

const getTotal = (data: ChartItem[]): number =>
  data.reduce((acc: number, item: ChartItem) => acc + item.value, 0);
export default function Component({
  chartData,
}: {
  chartData: Array<{ name: string; value: number }>;
}) {
  const total = getTotal(chartData);

  return (
    <Card className="mx-auto bg-transparent p-4 text-zinc-50">
      <CardHeader className="items-center pb-0">
        <CardTitle>Gráfico de Setores</CardTitle>
        <CardDescription>Ocorrências por Câmera</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6 md:flex-row">
        <PieChart width={310} height={280}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            dataKey="value"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>

        <div className="space-y-2">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <Label className="text-base">
                {entry.name} —{` ${entry.value}`}
                <span className="font-semibold">
                  ({((entry.value / total) * 100).toFixed(1)}%)
                </span>
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
