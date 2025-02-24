"use client";

import Occurrence from "@/app/components/Occurrence";
import StudentViewOwnOccurrence from "@/app/components/StudentViewOwnOccurrence";
import Link from "next/link";
import { api } from "@/lib/api";
import { UserContext } from "@/app/layout";
import { useContext, useEffect, useState } from "react";
import { OccurrenceData } from "@/app/utils/types/allTypes";

export default function Home() {
  const user = useContext(UserContext);
  const roleUser = user?.roles[0];
  const [infractions, setInfractions] = useState<OccurrenceData[]>([]);

  useEffect(() => {
    if (!user) return;

    async function fetchInfractions() {
      const endpoint =
        roleUser === "ROLE_STUDENT"
          ? `/students/${user?.sub}/occurrences`
          : `/occurrences/waiting-feedback`;

      try {
        const response = await api.get(endpoint);
        if (roleUser === "ROLE_STUDENT") setInfractions(response.data.content);
        else setInfractions(response.data);
      } catch (error) {
        console.error("Erro ao buscar infrações:", error);
      }
    }

    fetchInfractions();
  }, [user]);

  const numInfractions = infractions.length;
  const lastInfraction = infractions[numInfractions - 1];

  function renderMessageBox() {
    if (numInfractions === 0) return null;

    const message =
      roleUser === "ROLE_STUDENT"
        ? `${numInfractions} ocorrência${numInfractions > 1 ? "s" : ""} registrada`
        : `${numInfractions} ocorrência${numInfractions > 1 ? "s" : ""} aguardando análise!`;

    return (
      <div className="inline-block rounded-lg bg-amber-300 p-3 text-3xl font-bold text-[var(--background-color)]">
        {message}
      </div>
    );
  }

  function renderNoInfractionsMessage() {
    if (!roleUser) return <h1>Carregando...</h1>;

    return (
      <div className="flex-center flex-col gap-3 rounded-lg bg-zinc-800 p-4">
        <h2 className="text-3xl font-extrabold">
          {roleUser === "ROLE_STUDENT"
            ? "Nenhuma Infração Registrada! Continue Assim!"
            : "Nenhuma novidade por aqui!"}
        </h2>

        {roleUser !== "ROLE_STUDENT" && (
          <Link
            className="text-l cursor-pointer rounded-lg bg-red-600 p-2 hover:bg-red-700"
            href="/infractions"
          >
            Ver todas as Ocorrências
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="h-full space-y-6 p-4">
      <title>Phone Tracker | Página Inicial</title>

      {renderMessageBox()}

      <div className={`flex-center ${numInfractions === 0 ? "h-full" : ""}`}>
        {numInfractions !== 0 ? (
          <div className="flex flex-col gap-5">
            <Link
              className="text-l w-fit cursor-pointer rounded-lg bg-red-600 p-2 hover:bg-red-700"
              href="/infractions"
            >
              {`${roleUser === "ROLE_STUDENT" ? "Ver minhas ocorrências" : "Ver todas ocorrências"}`}
            </Link>

            {lastInfraction &&
              (roleUser === "ROLE_STUDENT" ? (
                <StudentViewOwnOccurrence {...lastInfraction} />
              ) : (
                <Occurrence {...lastInfraction} />
              ))}
          </div>
        ) : (
          renderNoInfractionsMessage()
        )}
      </div>
    </div>
  );
}
