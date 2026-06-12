export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const COOKIE_NAME = "gh_token";

    // ───────── LOGIN ─────────
    if (url.pathname === "/login") {
      const redirect = `https://github.com/login/oauth/authorize` +
        `?client_id=${env.GITHUB_CLIENT_ID}` +
        `&scope=repo,user` +
        `&redirect_uri=${url.origin}/callback`;

      return Response.redirect(redirect, 302);
    }

    // ───────── CALLBACK ─────────
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const data = await tokenRes.json();

      if (!data.access_token) {
        return new Response("Auth failed", { status: 401 });
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
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // ───────── PROTECT ADMIN ─────────
    if (url.pathname.startsWith("/admin")) {
      return fetch(request);
    }

    return new Response("OK");
  },
};