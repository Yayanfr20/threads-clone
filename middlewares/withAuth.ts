import { getToken } from "next-auth/jwt";
import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

export default function withAuth(
  middleware: NextMiddleware,
  requireAuth: string[] = []
) {
  return async (req: NextRequest, next: NextFetchEvent) => {
    const pathname = req.nextUrl.pathname;

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (requireAuth.includes(pathname)) {
      if (!token) {
        const url = new URL("/sign-in", req.url);
        url.searchParams.set("callbackUrl", encodeURI(req.url));
        return NextResponse.redirect(url);
      }
    }

    const authpath = ["/sign-in", "/sign-up"];
    if (token && authpath.includes(pathname)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return middleware(req, next);
  };
}
