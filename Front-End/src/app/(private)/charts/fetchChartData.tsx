import { api } from "@/lib/api";
import dayjs from "dayjs";
import { ChartLoaderProps } from "./ChartLoader";

export async function fetchAllChartData() {
  const res = await api.get("/charts");
  const data = res.data;

  const lineChartData = data.occurrencesByDay.labels.map(
    (label: any, index: any) => ({
      date: label,
      ocorrências: data.occurrencesByDay.data[index],
    }),
  );

  const pieChartData = data.occurrencesByCamera.labels.map(
    (label: any, index: any) => ({
      name: label,
      value: data.occurrencesByCamera.data[index],
    }),
  );

  const radarChartData = data.occurrencesByLocation.map((item: any) => ({
    local: item.location,
    ocorrências: item.count,
  }));

  return { lineChartData, pieChartData, radarChartData } as ChartLoaderProps;
}

export async function fetchStudentChartData({
  studentId,
}: {
  studentId?: string;
}) {
  const res = await api.get(`/students/${studentId}/occurrences`);
  const occurrences = res.data.content;

  const lineMap = new Map<string, number>();
  for (const item of occurrences) {
    const date = dayjs(item.date).format("YYYY-MM-DD");
    lineMap.set(date, (lineMap.get(date) || 0) + 1);
  }
  const lineChartData = Array.from(lineMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ocorrências]) => ({ date, ocorrências }));

  const pieMap = new Map<string, number>();
  for (const item of occurrences) {
    const camera = item.cameraId || "Desconhecida";
    pieMap.set(camera, (pieMap.get(camera) || 0) + 1);
  }
  const pieChartData = Array.from(pieMap.entries()).map(([name, value]) => ({
    name: `Câmera ${name}`,
    value,
  }));

  const radarMap = new Map<string, number>();
  for (const item of occurrences) {
    const local = item.local || "Indefinido";
    radarMap.set(local, (radarMap.get(local) || 0) + 1);
  }
  const radarChartData = Array.from(radarMap.entries()).map(
    ([local, ocorrências]) => ({
      local,
      ocorrências,
    }),
  );

  return { lineChartData, pieChartData, radarChartData };
}
