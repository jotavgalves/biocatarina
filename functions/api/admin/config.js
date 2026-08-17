const MAX_CONFIG_BYTES = 200000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateConfig(config) {
  if (!isPlainObject(config)) return "Configuração inválida.";
  if (!isPlainObject(config.site)) return "Seção site ausente.";
  if (!isPlainObject(config.carousel)) return "Seção carousel ausente.";
  if (!Array.isArray(config.carousel.slides)) return "Slides inválidos.";
  if (!Array.isArray(config.links)) return "Links inválidos.";
  if (!isPlainObject(config.featured)) return "Botão principal inválido.";
  if (!isPlainObject(config.bio)) return "Bio inválida.";
  if (!isPlainObject(config.services) || !Array.isArray(config.services.items)) return "Serviços inválidos.";
  return null;
}

export async function onRequestGet(context) {
  if (!context.env.BIO_CONFIG) return json({ error: "BIO_CONFIG indisponível." }, 503);
  const raw = await context.env.BIO_CONFIG.get("site-config");
  if (!raw) return json({ config: null });
  try {
    return json({ config: JSON.parse(raw) });
  } catch {
    return json({ error: "Configuração armazenada inválida." }, 500);
  }
}

export async function onRequestPut(context) {
  if (!context.env.BIO_CONFIG) return json({ error: "BIO_CONFIG indisponível." }, 503);

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const config = body?.config;
  const validationError = validateConfig(config);
  if (validationError) return json({ error: validationError }, 400);

  const serialized = JSON.stringify(config);
  const size = new TextEncoder().encode(serialized).byteLength;
  if (size > MAX_CONFIG_BYTES) {
    return json({ error: "Configuração excede 200 KB." }, 413);
  }

  const updatedAt = new Date().toISOString();
  await context.env.BIO_CONFIG.put("site-config", serialized, {
    metadata: { updatedAt },
  });

  return json({ ok: true, updatedAt, bytes: size });
}

export async function onRequestDelete(context) {
  if (!context.env.BIO_CONFIG) return json({ error: "BIO_CONFIG indisponível." }, 503);
  await context.env.BIO_CONFIG.delete("site-config");
  return json({ ok: true, reset: true });
}

export function onRequest() {
  return json({ error: "Método não permitido." }, 405, { allow: "GET, PUT, DELETE" });
}
