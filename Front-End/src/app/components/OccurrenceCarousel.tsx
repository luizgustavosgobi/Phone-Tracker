"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/app/components/ui/carousel";
import Occurrence from "./Occurrence";
import StudentViewOwnOccurrence from "./StudentViewOwnOccurrence";
import { UserContext } from "@/app/layout";
import { useContext, useEffect, useState } from "react";
import { OccurrenceData } from "../utils/types/allTypes";

type OccurrenceCarouselProps = {
  infractions: OccurrenceData[];
  InitialOccurence: number;
};

export default function OccurrenceCarousel({
  infractions,
  InitialOccurence,
}: OccurrenceCarouselProps) {
  const user = useContext(UserContext);
  const roleUser = user?.roles[0];
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="mx-auto w-3/5">
      <Carousel
        className="w-full"
        opts={{ startIndex: InitialOccurence ?? undefined }}
        setApi={setApi}
      >
        <CarouselContent>
          {infractions.map((infraction: OccurrenceData) => (
            <CarouselItem className="flex-center" key={infraction.id}>
              {roleUser === "ROLE_STUDENT" ? (
                <StudentViewOwnOccurrence {...infraction} />
              ) : (
                <Occurrence {...infraction} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className={`bg-zinc-800 ${current === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        />
        <CarouselNext
          className={`bg-zinc-800 ${current === count ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        />
      </Carousel>
      <div className="py-2 text-center text-sm">
        Ocorrência {current} de {count}
      </div>
    </div>
  );
}
