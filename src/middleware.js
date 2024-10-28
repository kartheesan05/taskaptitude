import { NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const protectedRoutes = ["/", "/result"];
const publicRoutes = ["/login"];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  const cookieStore = await cookies();
  
  const sessionCookie = cookieStore.get("session")?.value;
  const testQuestionsCookie = cookieStore.get("testQuestions")?.value;
  
  const session = await decrypt(sessionCookie);
  const testQuestions = testQuestionsCookie ? await decrypt(testQuestionsCookie) : null;

  // Redirect to login if no session
  if (isProtectedRoute && !session?.email) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect to department selection if trying to access test without department
  if (path === "/" && (!testQuestions || !testQuestions.department)) {
    return NextResponse.redirect(new URL("/starttest", req.nextUrl));
  }

  if (path === "/login" && session?.email) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
