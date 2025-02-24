"use client";

import { Suspense, useContext } from "react";
import { UserContext } from "@/app/layout";
import { ChartWrapper } from "./ChartWrapper";

export default function Page() {
  const user = useContext(UserContext);

  if (!user) {
    return <p>Usuário não autenticado.</p>;
  }

  const role = user.roles[0];

  return (
    <div className="m-10">
      <h1 className="mb-5 text-4xl font-bold">Gráficos Gerais</h1>

      <Suspense fallback={<p>Carregando gráficos...</p>}>
        <ChartWrapper role={role} />
      </Suspense>
    </div>
  );
}
