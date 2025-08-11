type role = "Estudante" | "Professor(a)" | "Inspetor(a)" | "Administrador(a)";

export type validateToken = {
  sub: string;
  roles: ("ROLE_STUDENT" | "ROLE_ADMIN" | "ROLE_TEACHER" | "ROLE_STAFF")[];
};

export type User = {
  id: string;
  name: string;
  role: role;
};

export type Student = Pick<User, "id" | "name"> & {
  course: string;
  photo: string;
  role: "Estudante";
};

export type OccurrenceData = {
  id: string;
  local: string;
  date: string;
  type: string;
  cameraId: string;
  proof: string;
  feedback?: {
    id: string;
    comments?: string;
    status: "ACCEPTED" | "REJECTED";
    student?: {
      name: string;
      id: string;
    };
  };
};
