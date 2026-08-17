function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
    },
  });
}

export async function onRequestGet(context) {
  if (!context.env.BIO_CONFIG) {
    return json({ config: null, source: "fallback", error: "BIO_CONFIG indisponível." }, 200);
  }

  const raw = await context.env.BIO_CONFIG.get("site-config");
  if (!raw) return json({ config: null, source: "fallback" });

  try {
    return json({ config: JSON.parse(raw), source: "kv" });
  } catch {
    return json({ config: null, source: "fallback", error: "Configuração salva inválida." }, 200);
  }
}

export function onRequest() {
  return json({ error: "Método não permitido." }, 405);
}
