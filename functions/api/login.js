const encoder = new TextEncoder();

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function safeEqual(a, b) {
  const [da, db] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < da.length; i += 1) diff |= da[i] ^ db[i];
  return diff === 0;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signSession(secret) {
  const payloadBytes = encoder.encode(JSON.stringify({
    exp: Date.now() + 12 * 60 * 60 * 1000,
    v: 1,
  }));
  const payload = bytesToBase64Url(payloadBytes);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  );
  return `${payload}.${bytesToBase64Url(signature)}`;
}

export async function onRequestPost(context) {
  const secret = context.env.ADMIN_PASSWORD;
  if (!secret) return json({ error: "ADMIN_PASSWORD não configurada." }, 503);

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const password = String(body?.password || "");
  if (!password || !(await safeEqual(password, secret))) {
    return json({ error: "Senha incorreta." }, 401);
  }

  const token = await signSession(secret);
  return json(
    { ok: true },
    200,
    {
      "set-cookie": `cq_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`,
    }
  );
}

export function onRequest() {
  return json({ error: "Método não permitido." }, 405, { allow: "POST" });
}
