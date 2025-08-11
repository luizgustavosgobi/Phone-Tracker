"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/app/layout";
import { getInfractions } from "./getInfractions";
import InfractionsClient from "./InfractionsClient";
import { OccurrenceData } from "@/app/utils/types/allTypes";

export default function InfractionsPage() {
  const user = useContext(UserContext);
  const roleUser = user?.roles[0];
  const [infractions, setInfractions] = useState<OccurrenceData[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const data =
        roleUser === "ROLE_STUDENT"
          ? await getInfractions({ studentId: user?.sub })
          : await getInfractions({});

      setInfractions(data);
    }

    fetchData();
  }, [roleUser, user]);

  return <InfractionsClient initialData={infractions} />;
}
