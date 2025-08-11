"use client";

import { useContext, useState } from "react";
import { OccurrenceData } from "@/app/utils/types/allTypes";
import PreviewOccurrence from "@/app/components/PreviewOccurrence";
import OccurrenceCarousel from "@/app/components/OccurrenceCarousel";
import { ArrowDownUp, ArrowUpDown } from "lucide-react";
import { UserContext } from "@/app/layout";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  initialData: OccurrenceData[];
}

export default function InfractionsClient({ initialData }: Props) {
  const isStudent = useContext(UserContext)?.roles[0] === "ROLE_STUDENT";
  const [toggleView, setToggleView] = useState(false);
  const [initialOccurrence, setInitialOccurrence] = useState<number | null>(
    null,
  );
  const [toggleIterableList, setToggleIterableList] = useState(false);
  const reversedList = initialData.slice().reverse();
  const iterableList = toggleIterableList ? initialData : reversedList;
  const router = useRouter();

  return (
    <div className="mb-10 h-full">
      <title>Phone Tracker | Ocorrências</title>

      <h1 className="my-5 text-center text-5xl font-extrabold">Ocorrências</h1>

      {initialData.length !== 0 && (
        <div className="flex justify-between">
          <button
            className="m-4 cursor-pointer rounded-lg bg-red-700 p-2 text-white hover:bg-red-800"
            onClick={() => {
              setInitialOccurrence(null);
              setToggleView(!toggleView);
            }}
          >
            Alterar visualização
          </button>

          {!toggleView && initialData.length > 0 && (
            <div className="flex">
              {!isStudent && (
                <button
                  onClick={() => router.push("/newOccurrence")}
                  className="m-4 cursor-pointer items-center rounded-lg bg-green-700 p-2 font-bold hover:bg-green-800"
                >
                  Adicionar Ocorrência
                </button>
              )}

              <button
                className="m-4 flex cursor-pointer gap-2.5 rounded-lg bg-green-700 p-2 hover:bg-green-800"
                onClick={() => setToggleIterableList(!toggleIterableList)}
              >
                Ordenar por período
                {toggleIterableList ? <ArrowDownUp /> : <ArrowUpDown />}
              </button>
            </div>
          )}
        </div>
      )}

      {initialData.length === 0 ? (
        <div className="flex h-[60dvh] items-center justify-center">
          <p className="text-center text-4xl font-bold text-zinc-400">
            {isStudent ? (
              "Nenhuma ocorrência registrada! Continue assim!"
            ) : (
              <span className="flex flex-col items-center gap-5">
                Nenhuma ocorrência registrada.{" "}
                <Link
                  className="ml-2 inline-block rounded-lg bg-[var(--highlight)] px-4 py-2 text-3xl text-white hover:bg-[var(--hover-highlight)]"
                  href="/newOccurrence"
                >
                  Adicionar ocorrência
                </Link>
              </span>
            )}
          </p>
        </div>
      ) : !toggleView ? (
        <div className="m-4 flex flex-col gap-4 rounded-lg bg-neutral-800 p-4">
          {iterableList.map((occurrence) => (
            <PreviewOccurrence
              {...occurrence}
              key={occurrence.id}
              onVisualize={() => {
                setInitialOccurrence(initialData.indexOf(occurrence));
                setToggleView(true);
              }}
            />
          ))}
        </div>
      ) : (
        <OccurrenceCarousel
          infractions={initialData}
          InitialOccurence={initialOccurrence || 0}
        />
      )}
    </div>
  );
}
