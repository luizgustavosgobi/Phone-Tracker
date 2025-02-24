"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/app/components/Form/index";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Switch } from "@/app/components/ui/switch";
import { useContext, useState } from "react";
import { UserContext } from "@/app/layout";

export default function changePassword() {
  const user = useContext(UserContext)!;
  const roleUser = user?.roles[0];
  const [isStudent, setIsStudent] = useState(true);

  const ChangePasswordFormSchema = z.object({
    id: z.string().or(z.literal("")),
    newPassword: z.string().min(6, {
      message: "A nova senha deve ter no mínimo 6 caracteres",
    }),
  });

  type ChangePasswordSchemaData = z.infer<typeof ChangePasswordFormSchema>;

  const methods = useForm<ChangePasswordSchemaData>({
    resolver: zodResolver(ChangePasswordFormSchema),
    defaultValues: {
      id: "",
      newPassword: "",
    },
  });

  async function AlteratePassword(data: ChangePasswordSchemaData) {
    let endpoint;

    if (roleUser === "ROLE_ADMIN") {
      endpoint = isStudent ? "students" : "users";
    } else if (roleUser === "ROLE_STAFF") {
      endpoint = "students";
    } else {
      return;
    }

    try {
      const response = await api.put(`/${endpoint}/change_password`, data);
      const message =
        endpoint === "students" ? "estudante " + data.id : "usuário " + data.id;

      if (response.status === 200) {
        toast.success(`Senha do ${message} alterada com sucesso!`);
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data?.message || error.message);
      }
    }
  }

  return (
    <div className="flex-center h-full">
      <title>Phone Tracker | Alterar Senha</title>

      <Form.Root<ChangePasswordSchemaData>
        title="Alterar Senha"
        formMethods={methods}
        onSubmit={AlteratePassword}
      >
        <Form.Input registerName="id" label="Id" />

        <Form.PasswordInput registerName="newPassword" label="Nova Senha" />

        {roleUser === "ROLE_ADMIN" && (
          <div className="mt-4 flex items-center space-x-2">
            <label>Estudante?</label>
            <Switch
              defaultChecked={true}
              onClick={() => setIsStudent(!isStudent)}
              className="cursor-pointer"
            />
          </div>
        )}

        <Form.Button />
        {roleUser !== "ROLE_TEACHER" && <Form.Link to="/" />}
      </Form.Root>
    </div>
  );
}
