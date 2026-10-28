import { NextResponse, type NextRequest } from "next/server";
import { MODULE_SLUGS } from "@/content/moduleSlugs";

const known = new Set<string>(MODULE_SLUGS);

/**
 * Module pages stream behind <Suspense>, so a notFound() there would arrive with
 * a 200 status. Checking the slug here returns a real 404 before rendering starts.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !known.has(decodeURIComponent(slug))) {
    return NextResponse.rewrite(new URL("/pagina-inexistenta", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/invata/:slug", "/invata/:slug/quiz"] };
