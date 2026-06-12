export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const COOKIE_NAME = "gh_token";

    // ─────────────────────────────
    // LOGIN
    // ─────────────────────────────
    if (url.pathname === "/login") {
      const redirect =
        "https://github.com/login/oauth/authorize" +
        `?client_id=${env.GITHUB_CLIENT_ID}` +
        `&scope=repo,user` +
        `&redirect_uri=${url.origin}/callback`;

      return Response.redirect(redirect, 302);
    }

    // ─────────────────────────────
    // CALLBACK
    // ─────────────────────────────
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");

      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code
          })
        }
      );

      const data = await tokenRes.json();

      if (!data.access_token) {
        return new Response(JSON.stringify(data, null, 2), {
          status: 401,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }

      return new Response(
        `<script>
          window.opener.postMessage(
            { token: "${data.access_token}" },
            "*"
          );
          window.close();
        </script>`,
        {
          headers: {
            "Content-Type": "text/html"
          }
        }
      );
    }

    // ─────────────────────────────
    // PROTECT /admin
    // ─────────────────────────────
    if (url.pathname.startsWith("/admin")) {
      const cookie = request.headers.get("Cookie") || "";

      if (!cookie.includes(COOKIE_NAME)) {
        return Response.redirect(`${url.origin}/login`, 302);
      }
    }

    // ─────────────────────────────
    // SIMPLE CHECK
    // ─────────────────────────────
    if (url.pathname === "/api/me") {
      const cookie = request.headers.get("Cookie") || "";

      if (!cookie.includes(COOKIE_NAME)) {
        return new Response("Not logged in", { status: 401 });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("420 Beans Auth OK 🚀");
  }
};