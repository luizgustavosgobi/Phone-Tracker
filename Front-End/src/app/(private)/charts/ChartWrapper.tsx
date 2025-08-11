"use client";

import { useEffect, useState } from "react";
import { fetchAllChartData, fetchStudentChartData } from "./fetchChartData";
import { ChartLoader, ChartLoaderProps } from "./ChartLoader";

interface Props {
  role: string;
  studentId?: string;
}

export function ChartWrapper({ role, studentId }: Props) {
  const [data, setData] = useState<ChartLoaderProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result =
          role === "ROLE_STUDENT"
            ? await fetchStudentChartData({ studentId })
            : role === "ROLE_STAFF" || role === "ROLE_ADMIN"
              ? await fetchAllChartData()
              : null;

        setData(result);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role, studentId]);

  if (loading) return <p>Carregando gráficos...</p>;
  if (!data) return <p>Erro ao carregar gráficos.</p>;

  return <ChartLoader {...data} />;
}
