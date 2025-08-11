"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/app/components/ui/sidebar";
import {
  Home,
  LogOut,
  ShieldAlert,
  Cog,
  UserCog,
  ChartColumn,
  Lock,
  CirclePlus,
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/app/layout";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export function AppSidebar() {
  const user = useContext(UserContext)!;
  const currentPath = usePathname();
  const router = useRouter();
  const userRole = user?.roles?.[0];

  async function logOutUser() {
    const token =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1] || null;

    if (token) {
      await api.get(`/auth/logout?token=${token}`);
    }

    document.cookie = `token=; Path=/; Expires=${new Date(0).toUTCString()};`;
    router.push("/sign-in");
  }

  const visibleItems = [
    {
      title: "Início",
      url: "/",
      icon: Home,
      roles: ["ROLE_ADMIN", "ROLE_STAFF", "ROLE_STUDENT"],
    },
    {
      title: "Infrações",
      url: "/infractions",
      icon: ShieldAlert,
      roles: ["ROLE_ADMIN", "ROLE_STAFF", "ROLE_STUDENT"],
    },
    {
      title: "Gráficos",
      url: "/charts",
      icon: ChartColumn,
      roles: ["ROLE_ADMIN", "ROLE_STAFF", "ROLE_STUDENT"],
    },
    {
      title: "Alterar Senha",
      url: "/changePassword",
      icon: Lock,
      roles: ["ROLE_ADMIN", "ROLE_STAFF"],
    },
    {
      title: "Nova Infração",
      url: "/newOccurrence",
      icon: CirclePlus,
      roles: ["ROLE_ADMIN", "ROLE_STAFF", "ROLE_TEACHER"],
    },
    {
      title: userRole === "ROLE_STAFF" ? "Estudantes" : "Usuários",
      url: "/dashboard",
      icon: UserCog,
      roles: ["ROLE_ADMIN", "ROLE_STAFF"],
    },
    {
      title: "Configurações",
      url: "/admin/config",
      icon: Cog,
      roles: ["ROLE_ADMIN"],
    },
    {
      title: "Sair",
      url: "/sign-in",
      icon: LogOut,
      roles: ["ROLE_ADMIN", "ROLE_STAFF", "ROLE_TEACHER", "ROLE_STUDENT"],
    },
  ];

  return (
    <Sidebar className="z-50 border-r-[var(--border-color)]">
      <SidebarContent className="overflow-hidden bg-neutral-900">
        <div className="flex-center justify-left m-0 flex h-[3.9rem] items-center p-3">
          <div className="rounded-lg bg-neutral-800 p-3 text-gray-50">
            <b>{user?.sub}</b>
          </div>
        </div>
        <SidebarSeparator className="bg-[var(--border-color)]" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems
                .filter((item) => item.roles.includes(userRole))
                .map((item) => (
                  <div key={item.title}>
                    {item.url === "/dashboard" && userRole === "ROLE_ADMIN" && (
                      <>
                        <SidebarSeparator className="my-2 bg-[var(--border-color)]" />
                        <h3 className="my-2 text-center text-xl font-bold text-amber-50">
                          Administrador
                        </h3>
                      </>
                    )}

                    {item.url === "/sign-in" && (
                      <SidebarSeparator className="my-2 bg-[var(--border-color)]" />
                    )}

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={item.url === currentPath}
                        className="cursor-pointer p-4.5 hover:bg-neutral-800 active:bg-neutral-800"
                        onClick={
                          item.url === "/sign-in" ? logOutUser : undefined
                        }
                      >
                        <Link href={item.url}>
                          <item.icon
                            size={24}
                            className={
                              item.url === "/sign-in"
                                ? "text-red-500"
                                : "text-gray-50"
                            }
                          />
                          <span
                            className={`text-[1.05rem] ${
                              item.url === "/sign-in"
                                ? "text-red-500"
                                : "text-gray-50"
                            }`}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </div>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
