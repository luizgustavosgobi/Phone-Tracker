"use client";

import {
  StandardIconAction,
  IconExcludeAction,
} from "@/app/components/iconAction";
import { UserPen, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { User, Student } from "@/app/utils/types/allTypes";

export default function UserActions({ user }: { user: User | Student }) {
  async function deleteUser({ userId }: { userId: string }) {
    const endpoint = isStudent === "y" ? "students" : "users";

    try {
      await api.delete(`/${endpoint}/delete?id=${userId}`);
      toast.success(
        `${isStudent ? "Estudante" : "Usuário"} excluído com sucesso!`,
      );
      window.location.reload();
      return;
    } catch {
      toast.error("Falha ao excluir usuário");
    }
  }

  function encryptBase64(value: string): string {
    return btoa(value);
  }

  const isStudent = (user.role as string) === "STUDENT" ? "y" : "n";
  const router = useRouter();

  return (
    <div className="flex space-x-2">
      {isStudent && (
        <StandardIconAction
          icon={Eye}
          tooltipContent="Ver Ocorrências"
          classNameIcon="h-7 w-7 p-1 rounded-lg text-white-400 hover:bg-zinc-600"
          onClick={() => router.push(`/charts/${user.id}`)}
        />
      )}

      <StandardIconAction
        icon={UserPen}
        tooltipContent="Editar"
        classNameIcon="h-7 w-7 p-1 rounded-lg text-amber-300 hover:bg-zinc-600"
        onClick={() =>
          router.push(`/edit-user/${user.id}?q=${encryptBase64(isStudent)}`)
        }
      />

      <IconExcludeAction
        {...user}
        icon={Trash2}
        confirmationMessage={`Realmente deseja excluir o ${isStudent ? "estudante" : "usuário"} ${user.name}?`}
        deleteElement={() => deleteUser({ userId: user.id })}
        classNameIcon="h-7 w-7 p-1 rounded-lg text-red-500 hover:bg-zinc-600"
      />
    </div>
  );
}
