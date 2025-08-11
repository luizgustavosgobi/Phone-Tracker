"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/app/components/Form/index";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { validateToken } from "@/app/utils/types/allTypes";

export default function SignIn() {
  const formSchema = z.object({
    id: z.string().min(4, {
      message: "id deve conter no mínimo 4 caracteres.",
    }),
    password: z.string().min(6, {
      message: "Senha deve conter no mínimo 6 caracteres.",
    }),
  });

  type LoginSchemaData = z.infer<typeof formSchema>;

  const methods = useForm<LoginSchemaData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  async function login(data: LoginSchemaData) {
    try {
      const response = await api.post(`/auth/login`, data);

      if (response.status === 200) {
        document.cookie = `token=${response.data.token}; path=/;`;
        const dataUser = jwtDecode(response.data.token) as validateToken;
        toast.success("Login realizado! Redirecionando...");

        if (dataUser?.roles[0] === "ROLE_TEACHER")
          window.location.href = "/newOccurrence";
        else window.location.href = "/";
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data?.message || error.message);
      }
    }
  }

  return (
    <div className="flex-center h-full flex-col gap-10">
      <title>Phone Tracker | Login</title>

      <Form.Root<LoginSchemaData>
        title="Login"
        formMethods={methods}
        onSubmit={login}
      >
        <Form.Input registerName="id" label="Usuário" />

        <Form.PasswordInput registerName="password" label="Senha" />

        <Form.Button>Entrar</Form.Button>
      </Form.Root>

      <p className="text-shadow-zinc-700">
        Caso não tenha um usuário, ou esqueceu a senha, contate um responsável
        técnico.
      </p>
    </div>
  );
}
