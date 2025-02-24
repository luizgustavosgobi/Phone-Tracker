"use client";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "./ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { useSidebar } from "@/app/components/ui/sidebar";
import logo from "../../../public/Logo.svg";
import clsx from "clsx";

export default function Header() {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <div className="flex-center gap-10 border-b-1 border-[var(--border-color)] bg-zinc-800 p-3 text-[#e2e2e2]">
      {pathname !== "/sign-in" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger
              className={clsx(
                "absolute z-50 ml-10 cursor-pointer",
                state === "expanded" ? "left-[13rem]" : "left-[1rem]",
              )}
            />
          </TooltipTrigger>
          <TooltipContent>
            {state === "expanded"
              ? "Fechar barra lateral"
              : "Abrir barra lateral"}
          </TooltipContent>
        </Tooltip>
      )}

      <div className="flex-center inline-flex gap-5">
        <img src={logo.src} alt="Logo" className="max-w-[3.75rem]" />
        <h1 className="text-3xl font-extrabold">Phone Tracker</h1>
      </div>
    </div>
  );
}
