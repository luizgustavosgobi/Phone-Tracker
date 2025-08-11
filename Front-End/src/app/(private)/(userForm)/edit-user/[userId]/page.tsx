"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/app/components/Form/index";
import z from "zod";
import { User, Student } from "@/app/utils/types/allTypes";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useContext } from "react";
import { UserContext } from "@/app/layout";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { classes, respectiveValues, formSchema } from "../../utils";

// Type guard
function isStudent(user: User | Student): user is Student {
  return (
    (user as Student).course !== undefined ||
    (user as Student).photo !== undefined
  );
}

const respectiveData = {
  STUDENT: "Estudante",
  TEACHER: "Professor(a)",
  STAFF: "Inspetor(a)",
  ADMIN: "Administrador(a)",
} as const;

export default function EditUser() {
  const isStaff = useContext(UserContext)?.roles[0] === "ROLE_STAFF";
  const params = useParams();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<User | Student | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);

  function decryptBase64(value: string): string {
    return atob(value);
  }

  const id = params?.userId;
  useEffect(() => {
    async function fetchUserData() {
      const slug = params?.userId as string | undefined;
      if (!slug) {
        setUserData(undefined);
        setLoading(false);
        return;
      }

      const q = searchParams.get("q") as string;
      const isStudent = decryptBase64(q);
      if (isStudent !== "y" && isStudent !== "n") {
        return router.push("/dashboard");
      }

      const endpoint = isStudent === "y" ? "students" : "users";

      try {
        const response = await api.get(`/${endpoint}/${id}`);

        if (response.status === 200) {
          setUserData(response.data as Student | User);
        } else {
          setUserData(undefined);
        }
      } catch (error) {
        setUserData(undefined);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [params]);

  type EditUserSchemaData = z.infer<typeof formSchema>;

  const isUserStudent = userData && isStudent(userData);

  const methods = useForm<EditUserSchemaData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      role: isStaff ? "Estudante" : undefined,
      photo: "",
      course: "",
    },
  });

  const { watch, reset } = methods;

  useEffect(() => {
    if (userData) {
      const isStudentUser = isStudent(userData);

      reset({
        id: userData.id || "",
        name: userData.name || "",
        role: isStaff
          ? "Estudante"
          : respectiveData[userData.role as keyof typeof respectiveData] ||
            undefined,
        photo: isStudentUser ? userData.photo || "" : "",
        course: isStudentUser ? userData.course || "" : "",
      });
    }
  }, [userData]);

  const roleStudentSelected = watch("role") === "Estudante";

  async function EditObject(data: EditUserSchemaData) {
    const { name, role } = data;
    data.role = respectiveValues[role] as EditUserSchemaData["role"];
    const endpoint = roleStudentSelected ? "students" : "users";

    const payload = roleStudentSelected
      ? { ...data, id }
      : { id, name, role: respectiveValues[role] };

    try {
      const response = await api.put(`/${endpoint}/edit`, payload);
      if (response.status === 200) {
        toast.success(
          `${roleStudentSelected ? "Estudante" : "Usuário"} editado com sucesso!`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data?.message || error.message);
      }
    }
  }

  const router = useRouter();

  useEffect(() => {
    if (!loading && userData === undefined) {
      toast.error("Usuário não Encontrado");
      router.push("/dashboard");
    }
  }, [loading, userData]);

  if (loading || userData === undefined) {
    return (
      <div className="flex-center h-dvh flex-col gap-10">
        <title>Phone Tracker | Editar Usuário</title>
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex-center h-full flex-col gap-10 p-10">
      <title>Phone Tracker | Editar Usuário</title>

      {userData == undefined ? (
        <div>
          <b>Usuário não Encontrado</b>
        </div>
      ) : (
        <Form.Root<EditUserSchemaData>
          title={`Editar ${roleStudentSelected ? "Estudante" : "Usuário"}`}
          formMethods={methods}
          onSubmit={EditObject}
        >
          <div className="w-[30rem]">
            <Form.Input registerName="name" label="Nome" className="w-full" />

            <div className="mb-3 flex gap-3">
              <Form.Input
                registerName="id"
                label="Id"
                className="flex-1"
                readOnly
              />

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
                  disabled={isStaff}
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
              <div className="flex-center w-[30rem] gap-5">
                <div className="flex-center mr-4 flex-col gap-2">
                  <img
                    src={
                      isUserStudent && watch("photo")
                        ? watch("photo")
                        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSseB6uZeeMH55OlfcMvLSB_O1j4c9eCKFcLQ&s"
                    }
                    className="h-20 w-20 rounded-full object-cover"
                    alt="Student Photo"
                  />
                  <span className="text-center">
                    {isUserStudent ? userData?.course : watch("course")}
                  </span>
                </div>

                <div className="relative">
                  <Form.Input registerName="photo" label="Foto" />
                  {roleStudentSelected && (
                    <span className="absolute top-1.5 left-[-2rem] text-[1.5em] text-red-500">
                      *
                    </span>
                  )}

                  <Form.ComboboxInput
                    registerName="course"
                    label="Curso"
                    placeholder="Selecione o curso do estudante"
                    items={classes}
                  />
                </div>
              </div>
            )}

            <Form.Button />
          </div>
          <Form.Link to="/dashboard" />
        </Form.Root>
      )}
    </div>
  );
}
