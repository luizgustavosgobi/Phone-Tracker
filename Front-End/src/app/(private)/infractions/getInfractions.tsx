import { api } from "@/lib/api";
import { OccurrenceData } from "@/app/utils/types/allTypes";

export async function getInfractions({
  studentId,
}: {
  studentId?: string;
}): Promise<OccurrenceData[]> {
  const endpoint = studentId
    ? `/students/${studentId}/occurrences`
    : "/occurrences";
  const response = await api.get(endpoint);
  return response.data.content;
}
