"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/app/components/Form/index";
import { useContext } from "react";
import { UserContext } from "@/app/layout";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function CreateOccurrence() {
  const user = useContext(UserContext)!;
  const isTeacher = user?.roles[0] === "ROLE_TEACHER";

  const CreateOccurrenceFormSchema = z.object({
    date: z.string().min(1, { message: "" }),
    cameraId: z.coerce.number().min(0, { message: "" }),
    local: z.string().optional(),
    proof: z.union([z.instanceof(File), z.string()]).optional(),
  });

  type CreateOccurrenceSchemaData = z.infer<typeof CreateOccurrenceFormSchema>;

  const methods = useForm<CreateOccurrenceSchemaData>({
    resolver: zodResolver(CreateOccurrenceFormSchema),
    defaultValues: {
      date: "",
      cameraId: 0,
      local: "",
      proof: undefined,
    },
  });

  async function sendData(data: CreateOccurrenceSchemaData) {
    const formData = new FormData();
    formData.append("date", data.date);
    formData.append("cameraId", String(data.cameraId));
    formData.append("type", "CELLPHONE");
    if (data.local) formData.append("local", String(data.local));

    if (data.proof) {
      formData.append("proof", data.proof as File);
    }

    try {
      const response = await api.post("/occurrences/create", formData);
      if (response.status === 200) {
        toast.success("Ocorrência criada com sucesso!");
        methods.reset();
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data?.message || error.message);
      }
    }
  }

  return (
    <div className="flex-center h-full">
      <title>Phone Tracker | Criar Infração</title>

      <Form.Root<CreateOccurrenceSchemaData>
        title="Criar Infração"
        formMethods={methods}
        onSubmit={sendData}
      >
        <div className="w-[18rem]">
          <div className="flex w-full gap-5">
            <Form.Input
              registerName="date"
              label="Data e Hora"
              type="datetime-local"
              className="w-[12.5rem] cursor-pointer"
            />

            <Form.Input
              registerName="cameraId"
              label="Câmera"
              type="number"
              min={"0"}
              className="w-[4rem]"
            />
          </div>

          <Form.Input registerName="local" label="Local" className="w-full" />

          <Form.FileInput registerName="proof" label="Prova" />
        </div>

        <Form.Button />
        {!isTeacher && <Form.Link to="/infractions" />}
      </Form.Root>
    </div>
  );
}
