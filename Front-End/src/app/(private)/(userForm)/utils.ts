import { z } from "zod";

export const respectiveValues = {
  Estudante: "STUDENT",
  "Professor(a)": "TEACHER",
  "Inspetor(a)": "STAFF",
  "Administrador(a)": "ADMIN",
};

export const classes = [
  "1º Ano Técnico em Redes de Computadores",
  "2º Ano Técnico em Redes de Computadores",
  "3º Ano Técnico em Redes de Computadores",
  "1º Ano Técnico em Química",
  "2º Ano Técnico em Química",
  "3º Ano Técnico em Química",
  "1º Ano Técnico em Mecatrônica",
  "2º Ano Técnico em Mecatrônica",
  "3º Ano Técnico em Mecatrônica",
  "1º Ano Técnico em Mecânica",
  "2º Ano Técnico em Mecânica",
];

export const formSchema = z
  .object({
    id: z.string().min(4, {
      message: "Id deve conter no mínimo 4 caracteres.",
    }),
    name: z.string().min(6, {
      message: "Nome deve conter no mínimo 6 caracteres.",
    }),
    role: z.enum(
      ["Professor(a)", "Inspetor(a)", "Administrador(a)", "Estudante"],
      {
        message: "Selecione um Cargo",
      },
    ),
    photo: z.string().optional(),
    course: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "Estudante" && !data.course) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["course"],
        message: "Curso é obrigatório para Estudantes.",
      });
    }
  });
