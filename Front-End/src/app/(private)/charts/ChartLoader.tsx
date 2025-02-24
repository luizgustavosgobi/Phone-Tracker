"use client";

import Chart from "../../components/charts/LineChart";
import PieChart from "../../components/charts/PieChart";
import RadarChart from "../../components/charts/RadarChart";

export type ChartLoaderProps = {
  lineChartData: Array<{ date: string; ocorrências: number }>;
  pieChartData: Array<{ name: string; value: number }>;
  radarChartData: Array<{ local: string; ocorrências: number }>;
};

export function ChartLoader({
  lineChartData,
  pieChartData,
  radarChartData,
}: ChartLoaderProps) {
  if (
    (!lineChartData || lineChartData.length === 0) &&
    (!pieChartData || pieChartData.length === 0) &&
    (!radarChartData || radarChartData.length === 0)
  ) {
    return <p>Nenhuma ocorrência registrada!</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <Chart chartData={lineChartData} />
      <div className="flex gap-5">
        <div className="flex-1">
          <RadarChart chartData={radarChartData} />
        </div>
        <div className="flex-1">
          <PieChart chartData={pieChartData} />
        </div>
      </div>
    </div>
  );
}
