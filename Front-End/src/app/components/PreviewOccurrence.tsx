"use client";

import { Trash } from "lucide-react";
import { StandardIconAction, IconExcludeAction } from "./iconAction";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import { respectiveInfos } from "./Occurrence";
import { useContext } from "react";
import { UserContext } from "../layout";
import { OccurrenceData } from "../utils/types/allTypes";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

export default function PreviewOccurrence({
  proof,
  cameraId,
  date,
  id,
  onVisualize,
  feedback,
}: Omit<OccurrenceData, "local" | "type"> & { onVisualize: () => void }) {
  const isStudent = useContext(UserContext)?.roles[0] === "ROLE_STUDENT";

  async function deleteOccurrence({ id }: { id: string }) {
    try {
      const response = await api.delete(
        `/occurrences/delete?occurrenceId=${id}`,
      );

      if (response.status === 200) {
        toast.success("Ocorrência excluída com sucesso!");
        window.location.reload();
      } else toast.error(response.data.message);
    } catch (error) {
      console.error(error);
    }
  }

  const OccurenceImage = `${process.env.NEXT_PUBLIC_API_URL}/proofs/public/${proof}`;
  const formatedDate = dayjs(date).format("dddd, D [de] MMMM [às] HH:mm");

  const styleStatusInfraction = feedback?.status
    ? {
        color: respectiveInfos[feedback?.status][1],
        borderColor: respectiveInfos[feedback?.status][1],
      }
    : { color: "#d97706", borderColor: "#d97706" };

  const statusOccurrence = (
    <h2
      className="absolute top-[-3rem] right-[-4rem] z-10 h-fit rotate-45 border-3 border-red-600 p-1 text-2xl font-bold text-red-600"
      style={styleStatusInfraction}
    >
      {feedback?.status ? respectiveInfos[feedback.status][0] : "PENDENTE"}
    </h2>
  );

  return (
    <div className="flex w-full items-center justify-between gap-8 rounded-lg bg-neutral-700 p-2">
      <div className="flex-center gap-3">
        <img
          className="h-20 w-30 rounded-lg object-cover"
          src={OccurenceImage}
        />
        <h2 className="text-3xl font-extrabold">Câmera {cameraId}</h2>
        <span className="text-zinc-400">{formatedDate}</span>

        {!isStudent && (
          <span
            className="rounded-sm border-2 p-1 px-2 text-xl font-medium"
            style={styleStatusInfraction}
          >
            {feedback?.status
              ? respectiveInfos[feedback.status][0]
              : "PENDENTE"}
          </span>
        )}
      </div>
      <div className="flex-center">
        <StandardIconAction
          icon={Eye}
          classNameIcon="h-10 w-10 hover:bg-zinc-800 p-1 rounded-lg"
          tooltipContent="Visualizar"
          onClick={onVisualize}
        />

        {!isStudent && (
          <IconExcludeAction
            icon={Trash}
            name={`Câmera ${cameraId}`}
            id={formatedDate}
            photo={OccurenceImage}
            confirmationMessage={`Realmente deseja excluir essa infração?`}
            classNameIcon="h-10 w-10 text-red-500 hover:bg-zinc-800 p-1 rounded-lg"
            deleteElement={() => deleteOccurrence({ id })}
            statusOccurrence={statusOccurrence}
          />
        )}
      </div>
    </div>
  );
}
