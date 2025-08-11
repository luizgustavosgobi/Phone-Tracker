"use client";

import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";
import { OccurrenceData } from "@/app/utils/types/allTypes";
import dayjs from "dayjs";
import MagnifyImage from "./MagnifyImage";

export default function StudentViewOwnOccurrence({
  date,
  cameraId,
  proof,
  feedback,
}: OccurrenceData) {
  const formatedDate = dayjs(date).format("dddd, D [de] MMMM [às] HH:mm");

  return (
    <div className="relative flex gap-8 rounded-lg border bg-zinc-800 p-4 shadow-[inset_0_0_2px]">
      <div className="flex-center">
        <MagnifyImage
          url={`${process.env.NEXT_PUBLIC_API_URL}/proofs/public/${proof}`}
        />
      </div>
      <div className="rounded-lg p-3">
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-3xl font-extrabold">Câmera {cameraId}</h2>
          <p className="text-zinc-400">{formatedDate}</p>
        </div>

        <div className="mt-4 space-y-4">
          <Label>Vinculado ao Estudante:</Label>
          <Input
            value={`${feedback?.student?.id} - ${feedback?.student?.name}`}
            disabled
          />

          <Label>Observações:</Label>
          <Textarea
            value={feedback?.comments ?? ""}
            className="resize-none"
            disabled
          />
        </div>
      </div>
    </div>
  );
}
