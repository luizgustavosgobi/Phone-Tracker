import { api } from "@/lib/api";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { validateToken } from "@/app/utils/types/allTypes";
import { AxiosResponse } from "axios";

export default async function Dashboard() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  const headers = { Authorization: `Bearer ${token}` };

  const user = jwtDecode(token!) as validateToken;
  const users = await getData({ user, headers });

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={users} searchFields={["name", "id"]} />
    </div>
  );
}

async function getData({
  user,
  headers,
}: {
  user: validateToken;
  headers: { Authorization: string };
}) {
  const id = user.sub;
  const role = user.roles[0];
  let endpoints: Promise<AxiosResponse<any>>[] = [];

  if (role === "ROLE_ADMIN") {
    endpoints = [
      api.get("/students", { headers }),
      api.get("/users", { headers }),
    ];
  } else if (role === "ROLE_STAFF") {
    endpoints = [api.get("/students", { headers })];
  } else {
    endpoints = [];
  }

  const results = await Promise.all(endpoints);
  const allData = results.flatMap((res) => res.data.content);
  const filteredData = allData.filter((item) => item.id !== id);

  return filteredData;
}
