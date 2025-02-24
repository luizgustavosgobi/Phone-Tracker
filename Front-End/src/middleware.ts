import { NextRequest, NextResponse, type MiddlewareConfig } from "next/server";
import { jwtDecode } from "jwt-decode";
import type { validateToken } from "@/app/utils/types/allTypes";

function redirectTo(path: string, request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = path;
  return NextResponse.redirect(redirectUrl);
}

const publicRoutes = [
  { path: "/sign-in", whenAuthenticated: "redirect" },
] as const;

const PATH_WHEN_NOT_AUTHENTICATED_ROUTE = "/sign-in";

const AdminAndStaffRole = ["ROLE_ADMIN", "ROLE_STAFF"];

const rolePermissions: Record<string, string[]> = {
  "/": [...AdminAndStaffRole, "ROLE_STUDENT"],
  "/infractions": [...AdminAndStaffRole, "ROLE_STUDENT"],
  "/charts": [...AdminAndStaffRole, "ROLE_STUDENT"],
  "/changePassword": [...AdminAndStaffRole],
  "/newOccurrence": [...AdminAndStaffRole, "ROLE_TEACHER"],
  "/dashboard": [...AdminAndStaffRole],
  "/admin/config": ["ROLE_ADMIN"],
  "/create-user": [...AdminAndStaffRole],
  "/edit-user": [...AdminAndStaffRole],
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);
  const authToken = request.cookies.get("token")?.value;

  if (!authToken && publicRoute) {
    return NextResponse.next();
  }

  if (
    authToken &&
    publicRoute &&
    publicRoute.whenAuthenticated === "redirect"
  ) {
    try {
      const dataUser = jwtDecode<validateToken>(authToken);
      const userRole = dataUser.roles[0];

      const allowedForRoot = rolePermissions["/"]?.includes(userRole);

      if (allowedForRoot) {
        return redirectTo("/", request);
      } else {
        const redirectPath =
          userRole === "ROLE_TEACHER" ? "/newOccurrence" : "/";
        return redirectTo(redirectPath, request);
      }
    } catch {
      return NextResponse.next();
    }
  }

  if (!authToken && !publicRoute) {
    return redirectTo(PATH_WHEN_NOT_AUTHENTICATED_ROUTE, request);
  }

  if (authToken && !publicRoute) {
    try {
      const dataUser = jwtDecode<validateToken>(authToken);
      const userRole = dataUser.roles[0];

      const allowedRoles = Object.entries(rolePermissions).find(
        ([route]) => path === route || path.startsWith(`${route}/`),
      )?.[1];

      if (allowedRoles && !allowedRoles.includes(userRole)) {
        const redirectPath =
          userRole === "ROLE_TEACHER" ? "/newOccurrence" : "/";
        if (path !== redirectPath) {
          return redirectTo(redirectPath, request);
        }
      }
    } catch (e) {
      return redirectTo(PATH_WHEN_NOT_AUTHENTICATED_ROUTE, request);
    }
  }

  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
