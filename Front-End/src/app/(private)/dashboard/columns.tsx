"use client";

import { ColumnDef } from "@tanstack/react-table";
import UserActions from "./userActions";

const respectiveValues = {
  STUDENT: "Estudante",
  TEACHER: "Professor(a)",
  STAFF: "Inspetor(a)",
  ADMIN: "Administrador(a)",
} as const;

export const columns: ColumnDef<any>[] = [
  {
    header: "Foto",
    cell: ({ row }) =>
      row.original.photo ? (
        <img
          src={row.original.photo}
          alt={row.original.name || "Foto do estudante"}
          className="mx-auto h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <span>-</span>
      ),
  },
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "id",
    header: "Identificador",
  },
  {
    header: "Cargo",
    cell: ({ row }) => {
      return respectiveValues[
        row.original.role as keyof typeof respectiveValues
      ];
    },
  },
  {
    header: "Ações",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <UserActions user={row.original} />
      </div>
    ),
    meta: { className: "text-center" },
  },
];
