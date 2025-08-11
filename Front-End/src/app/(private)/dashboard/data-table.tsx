"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  useReactTable,
  SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  FilterFnOption,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Input } from "@/app/components/ui/input";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { UserContext } from "@/app/layout";

function normalizeString(value: string, whiteSpaceReplace = "-") {
  const alphabetSpecialChars = "àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;";
  const alphabetCommonChars = "aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------";

  const normalizedValue = value
    .trim()
    .toLowerCase()
    .trim()
    .replace(/ /g, whiteSpaceReplace)
    .replace(/--/g, "-")
    .replace(/[&/\\#,+()$~%.'":*?<>{}\[\]]/g, "")
    .replace(new RegExp(alphabetSpecialChars.split("").join("|"), "g"), (c) =>
      alphabetCommonChars.charAt(alphabetSpecialChars.indexOf(c)),
    );

  return normalizedValue;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  searchFields?: string[];
  defaultSearch?: string;
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  searchFields = [],
  defaultSearch = "",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState(defaultSearch);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      fuzzy: (row, _, value) => {
        const data = row.original;
        const search = normalizeString(value);
        data.companyName = data?.company?.name;

        return searchFields.some((field) =>
          normalizeString(data[field].toString()).includes(search),
        );
      },
    },
    globalFilterFn: "fuzzy" as FilterFnOption<TData>,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const router = useRouter();
  const userRole = useContext(UserContext)?.roles[0];

  return (
    <div className="flex-center flex-col gap-4">
      <div className="w-3/5">
        <div className="mx-1 flex justify-between gap-4">
          <Input
            placeholder="Filtre por nome ou id..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm border-zinc-300"
          />

          <button
            onClick={() => router.push("/create-user")}
            className="cursor-pointer rounded-lg bg-green-700 p-3 font-bold hover:bg-green-800"
          >
            {`Adicionar ${userRole === "ROLE_ADMIN" ? "Usuário" : "Estudante"}`}
          </button>
        </div>

        <div className="flex-center mt-4 overflow-hidden rounded-md border">
          <Table className="border border-zinc-300 bg-zinc-900">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-zinc-900 text-lg text-gray-50 hover:bg-zinc-900"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-center text-gray-300"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody className="hover:bg-gray-800">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="bg-zinc-800 hover:bg-zinc-700"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 bg-zinc-800 text-center"
                  >
                    Sem resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
