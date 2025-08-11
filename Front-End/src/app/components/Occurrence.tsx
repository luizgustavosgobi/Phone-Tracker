"use client";

import UiForm from "@/app/components/ui/form";
import { SubmitButton } from "@/app/components/ui/button";
import { Form } from "@/app/components/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OccurrenceData } from "@/app/utils/types/allTypes";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useState, useContext } from "react";
import { UserContext } from "../layout";
import MagnifyImage from "@/app/components/MagnifyImage";
import dayjs from "dayjs";

export const respectiveInfos = {
  ACCEPTED: ["ACEITA", "#16a34a"],
  REJECTED: ["REJEITADA", "#dc2626"],
} as const satisfies Record<string, readonly [string, string]>;

export default function Occurrence({
  id,
  date,
  cameraId,
  proof,
  feedback,
}: OccurrenceData) {
  const roleUser = useContext(UserContext)?.roles[0];
  const [clickedStatus, setClickedStatus] = useState<
    "ACCEPTED" | "REJECTED" | null
  >(null);

  const formSchema = z.object({
    studentId: z.string().or(z.literal("")),
    comments: z
      .string()
      .min(7, {
        message: "Comentário deve ter no mínimo 7 caracteres",
      })
      .or(z.literal("")),
  });

  type FormSchemaData = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: feedback?.student
        ? `${feedback?.student?.id} - ${feedback?.student?.name}`
        : "",
      comments: feedback?.comments ?? "",
    },
  });

  async function sendFeedback(data: FormSchemaData) {
    const status = clickedStatus;
    if (status === "ACCEPTED") {
      data.studentId = data.studentId.split(" - ")[0];
    }
    const payload = status === "REJECTED" ? { status } : { ...data, status };

    try {
      const response = await api.post(
        `/occurrences/feedback?occurrenceId=${id}`,
        payload,
      );

      if (response.status === 200) {
        toast.success("Feedback enviado com sucesso!");
        window.location.reload();
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data?.message || error.message);
      }
    }
  }

  const formatedDate = dayjs(date).format("dddd, D [de] MMMM [às] HH:mm");

  const InputCommonProps = {
    registerName: "studentId",
    label: `${feedback ? "Vinculado ao Estudante:" : "Vincular ao Estudante:"}`,
    disabled: !!feedback,
    placeholder: !feedback ? "Nome ou Prontuário" : undefined,
  };

  return (
    <div className="relative flex gap-8 rounded-lg bg-zinc-800 p-4 shadow-[inset_0_0_2px]">
      <div>
        {feedback?.status && (
          <span
            className="flex-center text-5xl font-bold underline"
            style={{
              color: respectiveInfos[feedback.status][1],
            }}
          >
            {respectiveInfos[feedback.status][0]}
          </span>
        )}

        <div className="flex gap-5">
          <div className="flex-center">
            {proof ? (
              <MagnifyImage
                url={`${process.env.NEXT_PUBLIC_API_URL}/proofs/public/${proof}`}
              />
            ) : (
              <div className="flex-center mt-3 h-[20rem] w-[20rem] rounded-lg border border-white">
                Sem imagem
              </div>
            )}
          </div>

          <div className="flex-center flex-col rounded-lg p-3">
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-3xl font-extrabold">Câmera {cameraId}</h2>
              <p className="text-zinc-400">{formatedDate}</p>
            </div>

            <UiForm {...form}>
              <form onSubmit={form.handleSubmit(sendFeedback)}>
                <div>
                  {roleUser !== "ROLE_STUDENT" && !feedback ? (
                    <Form.AutoCompleteInput {...InputCommonProps} />
                  ) : (
                    <Form.Input {...InputCommonProps} />
                  )}
                </div>

                <Form.TextareaInput
                  label="Observações:"
                  registerName="comments"
                  disabled={!!feedback}
                />

                <div className="mt-4 flex w-full gap-4">
                  <SubmitButton
                    isSubmitting={
                      clickedStatus === "ACCEPTED"
                        ? form.formState.isSubmitting
                        : false
                    }
                    className="flex-1 cursor-pointer rounded-lg bg-green-700 p-2 hover:bg-green-800"
                    disabled={!!feedback}
                    onClick={() => setClickedStatus("ACCEPTED")}
                  >
                    Confirmar
                  </SubmitButton>

                  <SubmitButton
                    isSubmitting={
                      clickedStatus === "REJECTED"
                        ? form.formState.isSubmitting
                        : false
                    }
                    className="flex-1 cursor-pointer rounded-lg bg-red-700 p-2 hover:bg-red-800"
                    disabled={!!feedback}
                    onClick={() => setClickedStatus("REJECTED")}
                  >
                    Rejeitar
                  </SubmitButton>
                </div>
              </form>
            </UiForm>
          </div>
        </div>
      </div>
    </div>
  );
}
