import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next");
  const redirectPath = next?.startsWith("/") && !next.startsWith("//")
    ? next
    : "/";

  // If OAuth provider returned an error (e.g., user cancelled login)
  if (error) {
    console.error("Auth callback error:", error, errorDescription);
    const errorUrl = new URL(redirectPath, origin);
    errorUrl.searchParams.set("auth_error", errorDescription || error);
    return NextResponse.redirect(errorUrl.toString());
  }

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            },
          },
        }
      );
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError.message);
        const errorUrl = new URL(redirectPath, origin);
        errorUrl.searchParams.set("auth_error", exchangeError.message);
        return NextResponse.redirect(errorUrl.toString());
      }
    } catch (err) {
      console.error("Unexpected error in auth callback:", err);
      const errorUrl = new URL(redirectPath, origin);
      errorUrl.searchParams.set("auth_error", "Authentication failed. Please try again.");
      return NextResponse.redirect(errorUrl.toString());
    }
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
