"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/app/components/Form/index";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useContext } from "react";
import { UserContext } from "@/app/layout";
import { classes, respectiveValues, formSchema } from "../utils";

export default function CreateUser() {
  const isStaff = useContext(UserContext)?.roles[0] === "ROLE_STAFF";
  type CreateUserSchemaData = z.infer<typeof formSchema>;

  const methods = useForm<CreateUserSchemaData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      role: isStaff ? "Estudante" : undefined,
      photo: "",
      course: "",
    },
  });

  const { watch } = methods;
  const roleStudentSelected = watch("role") === "Estudante";
  const formTitle = `Adicionar ${roleStudentSelected ? "Estudante" : "Usuário"}`;

  async function createNewUser(data: CreateUserSchemaData) {
    const { id, name, role } = data;
    data.role = respectiveValues[role] as CreateUserSchemaData["role"];
    const endpoint = roleStudentSelected ? "students" : "users";

    const payload = roleStudentSelected
      ? data
      : { id, name, role: respectiveValues[role] };

    try {
      const response = await api.post(`/${endpoint}/create`, payload);

      if (response.status === 200) {
        toast.success(
          `${roleStudentSelected ? "Estudante" : "Usuário"} criado com sucesso!`,
        );
        methods.reset();
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data?.message || error.message);
      }
    }
  }

  return (
    <div className="flex-center h-full p-10">
      <title>Phone Tracker | Adicionar Usuário</title>

      <Form.Root<CreateUserSchemaData>
        title={formTitle}
        formMethods={methods}
        onSubmit={createNewUser}
      >
        <div className="w-[30rem]">
          <Form.Input registerName="name" label="Nome" className="w-full" />

          <div className="mb-3 flex gap-3">
            <Form.Input registerName="id" label="Id" className="flex-1" />

            <div className="relative">
              <Form.ComboboxInput
                registerName="role"
                label="Cargo"
                placeholder="Selecione o cargo"
                items={
                  isStaff
                    ? ["Estudante"]
                    : [
                        "Estudante",
                        "Professor(a)",
                        "Inspetor(a)",
                        "Administrador(a)",
                      ]
                }
                className="w-[12rem]"
                showSearch={false}
              />

              {roleStudentSelected && (
                <span className="absolute top-1.5 right-0 text-[1.5em] text-red-500">
                  *
                </span>
              )}
            </div>
          </div>

          {roleStudentSelected && (
            <div className="flex-center w-full gap-5 rounded-lg p-4">
              <div className="flex-center relative mr-4 flex-col gap-2">
                <img
                  src={
                    watch("photo") ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSseB6uZeeMH55OlfcMvLSB_O1j4c9eCKFcLQ&s" ||
                    undefined
                  }
                  className="h-20 w-20 rounded-full object-cover"
                  alt="estudant Photo"
                />
                <span className="text-center">
                  {watch("course") || "Sala do Estudante" || ""}
                </span>
              </div>

              <div className="relative">
                <Form.Input registerName="photo" label="Foto" />

                <Form.ComboboxInput
                  registerName="course"
                  label="Curso"
                  placeholder="Selecione o curso do estudante"
                  items={classes}
                />

                <span className="absolute top-1.5 left-[-2rem] text-[1.5em] text-red-500">
                  *
                </span>
              </div>
            </div>
          )}

          <Form.Button />
        </div>
        <Form.Link to="/dashboard" />
      </Form.Root>
    </div>
  );
}
