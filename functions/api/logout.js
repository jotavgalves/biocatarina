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

export function onRequestPost() {
  return json(
    { ok: true },
    200,
    {
      "set-cookie": "cq_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
    }
  );
}

export function onRequest() {
  return json({ error: "Método não permitido." }, 405, { allow: "POST" });
}
