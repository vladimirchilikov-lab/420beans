const supportedProviders = ['github', 'gitlab'];
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const outputHTML = ({ provider = 'unknown', token, error, errorCode }) => {
  const state = error ? 'error' : 'success';
  const content = error ? { provider, error, errorCode } : { provider, token };
  return new Response(
    `<!doctype html><html><body><script>
      (() => {
        window.addEventListener('message', ({ data, origin }) => {
          if (data === 'authorizing:${provider}') {
            window.opener?.postMessage(
              'authorization:${provider}:${state}:${JSON.stringify(content)}',
              origin
            );
          }
        });
        window.opener?.postMessage('authorizing:${provider}', '*');
      })();
    </script></body></html>`,
    { headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Set-Cookie': `csrf-token=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure`,
    }},
  );
};

const handleAuth = async (request, env) => {
  const { url } = request;
  const { origin, searchParams } = new URL(url);
  const { provider, site_id: domain } = Object.fromEntries(searchParams);
  if (!provider || !supportedProviders.includes(provider)) {
    return outputHTML({ error: 'Your Git backend is not supported.', errorCode: 'UNSUPPORTED_BACKEND' });
  }
  const { ALLOWED_DOMAINS, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_HOSTNAME = 'github.com' } = env;
  if (ALLOWED_DOMAINS && !ALLOWED_DOMAINS.split(/,/).some((str) =>
    (domain ?? '').match(new RegExp(`^${escapeRegExp(str.trim()).replace('\\*', '.+')}$`))
  )) {
    return outputHTML({ provider, error: 'Your domain is not allowed.', errorCode: 'UNSUPPORTED_DOMAIN' });
  }
  const csrfToken = globalThis.crypto.randomUUID().replaceAll('-', '');
  if (provider === 'github') {
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return outputHTML({ provider, error: 'OAuth app not configured.', errorCode: 'MISCONFIGURED_CLIENT' });
    }
    const params = new URLSearchParams({ client_id: GITHUB_CLIENT_ID, scope: 'repo,user', state: csrfToken });
    return new Response('', {
      status: 302,
      headers: {
        Location: `https://${GITHUB_HOSTNAME}/login/oauth/authorize?${params}`,
        'Set-Cookie': `csrf-token=github_${csrfToken}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`,
      },
    });
  }
  return outputHTML({ error: 'Unsupported provider.', errorCode: 'UNSUPPORTED_BACKEND' });
};

const handleCallback = async (request, env) => {
  const { url, headers } = request;
  const { origin, searchParams } = new URL(url);
  const { code, state } = Object.fromEntries(searchParams);
  const [, provider, csrfToken] = headers.get('Cookie')?.match(/\bcsrf-token=([a-z-]+?)_([0-9a-f]{32})\b/) ?? [];
  if (!provider || !supportedProviders.includes(provider)) {
    return outputHTML({ error: 'Unsupported backend.', errorCode: 'UNSUPPORTED_BACKEND' });
  }
  if (!code || !state) {
    return outputHTML({ provider, error: 'No auth code received.', errorCode: 'AUTH_CODE_REQUEST_FAILED' });
  }
  if (!csrfToken || state !== csrfToken) {
    return outputHTML({ provider, error: 'CSRF detected.', errorCode: 'CSRF_DETECTED' });
  }
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_HOSTNAME = 'github.com' } = env;
  let response;
  try {
    response = await fetch(`https://${GITHUB_HOSTNAME}/login/oauth/access_token`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET }),
    });
  } catch { }
  if (!response) {
    return outputHTML({ provider, error: 'Token request failed.', errorCode: 'TOKEN_REQUEST_FAILED' });
  }
  let token, error;
  try { ({ access_token: token, error } = await response.json()); }
  catch { return outputHTML({ provider, error: 'Malformed response.', errorCode: 'MALFORMED_RESPONSE' }); }
  return outputHTML({ provider, token, error });
};

export default {
  async fetch(request, env) {
    const { method, url } = request;
    const { pathname } = new URL(url);
    if (method === 'GET' && ['/auth', '/oauth/authorize'].includes(pathname)) return handleAuth(request, env);
    if (method === 'GET' && ['/callback', '/oauth/redirect'].includes(pathname)) return handleCallback(request, env);
    return new Response('', { status: 404 });
  },
};