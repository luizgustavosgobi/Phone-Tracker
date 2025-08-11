"use client";

import { useEffect, useState } from "react";
import { fetchStudentChartData } from "./../fetchChartData";
import { ChartLoader, ChartLoaderProps } from "./../ChartLoader";
import { useParams } from "next/navigation";

export function ChartWrapper({ role }: { role: string }) {
  const params = useParams() as { studentId?: string };
  const [data, setData] = useState<ChartLoaderProps | null>(null);
  const [loading, setLoading] = useState(true);
  const studentId = params.studentId;

  useEffect(() => {
    if (
      (role === "ROLE_STAFF" || role === "ROLE_ADMIN") &&
      typeof studentId === "string"
    ) {
      async function fetchData() {
        setLoading(true);
        try {
          const result = await fetchStudentChartData({ studentId });
          setData(result);
        } catch (error) {
          console.error("Erro ao buscar dados do gráfico:", error);
          setData(null);
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    } else {
      setData(null);
      setLoading(false);
    }
  }, [role, studentId]);

  if (loading) return <p>Carregando gráficos...</p>;
  if (!data) return <p>Erro ao carregar gráficos.</p>;

  return <ChartLoader {...data} />;
}
