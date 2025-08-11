"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function Component({
  chartData,
}: {
  chartData: Array<{ local: string; ocorrências: number }>;
}) {
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Gráfico de Radar Interativo</CardTitle>
        <CardDescription>Ocorrências por Local</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="local" />
              <Radar
                dataKey="ocorrências"
                stroke="#dd2a56"
                fill="#dd2a56"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
