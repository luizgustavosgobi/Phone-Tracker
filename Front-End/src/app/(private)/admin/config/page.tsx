"use client";

import UiForm from "@/app/components/ui/form";
import { Form } from "@/app/components/Form";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Config() {
  const [toggleBooleanValue, setToggleBooleanValue] = useState(true);

  const form = useForm({
    defaultValues: {
      deleteOccurrences: toggleBooleanValue,
      days: 2,
    },
  });

  const { register, handleSubmit, setValue } = form;

  async function sendData() {
    await new Promise((r) => setTimeout(r, 3000));
    toast.success("Alterações salvas com sucesso");
  }

  return (
    <div className="h-full text-lg">
      <title>Phone Tracker | Configurações</title>

      <h1 className="m-8 text-4xl font-bold">Configurações</h1>

      <div className="m-8 flex flex-row items-start gap-6 rounded bg-zinc-800 p-6">
        <UiForm {...form}>
          <form
            onSubmit={handleSubmit(sendData)}
            className="flex w-full items-center justify-between gap-10"
          >
            <div className="flex items-center gap-10">
              <div className="text-l inline-flex items-center gap-2">
                <span className="min-w-fit rounded-sm bg-zinc-700 px-2 py-1">
                  Excluir Gravações
                </span>
                =
                <input
                  type="checkbox"
                  {...register("deleteOccurrences")}
                  className="scale-140 cursor-pointer rounded-sm bg-zinc-700 p-2 accent-[var(--highlight)]"
                  checked={toggleBooleanValue}
                  onChange={() => {
                    const newValue = !toggleBooleanValue;
                    setToggleBooleanValue(newValue);
                    setValue("deleteOccurrences", newValue);
                  }}
                />
              </div>

              <div className="text-l inline-flex items-center gap-2">
                <span className="min-w-fit rounded-sm bg-zinc-700 px-2 py-1">
                  Apagar a cada
                </span>
                =
                <input
                  type="number"
                  min={0}
                  className="w-[3.5rem] rounded-sm bg-zinc-700 px-2 py-1"
                  {...register("days", { valueAsNumber: true })}
                />
                Dias
              </div>
            </div>

            <Form.Button className="max-w-fit px-3">Salvar</Form.Button>
          </form>
        </UiForm>
      </div>
    </div>
  );
}
