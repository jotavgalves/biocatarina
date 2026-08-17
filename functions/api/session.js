const encoder = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function getCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  const part = cookie.split(/;\s*/).find((item) => item.startsWith(`${name}=`));
  return part ? part.slice(name.length + 1) : "";
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function verifySession(token, secret) {
  if (!token || !secret || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      encoder.encode(payload)
    );
    if (!valid) return false;

    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    return data?.v === 1 && Number(data?.exp) > Date.now();
  } catch {
    return false;
  }
}

export async function onRequestGet(context) {
  const token = getCookie(context.request, "cq_admin");
  const authenticated = await verifySession(token, context.env.ADMIN_PASSWORD);
  return json({ authenticated });
}

export function onRequest() {
  return json({ error: "Método não permitido." }, 405);
}
