import { getStore } from "@netlify/blobs";

const PASSWORD = process.env.ADMIN_PASSWORD || "1234";
const OK1 = ["si", "no", "depende"];
const OK2 = ["si", "no", null];

export default async (req) => {
  const store = getStore("respuestas");

  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return Response.json({ error: "JSON inválido" }, { status: 400 }); }
    const q2 = b.q2 ?? null;
    if (!OK1.includes(b.q1) || !OK2.includes(q2)) {
      return Response.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const registro = {
      q1: b.q1,
      justificacion: b.q1 === "depende" ? String(b.justificacion || "").slice(0, 1000) : "",
      q2,
      fecha: new Date().toISOString(),
    };
    await store.setJSON(crypto.randomUUID(), registro);
    return Response.json({ ok: true });
  }

  if (req.method === "GET") {
    if (req.headers.get("x-password") !== PASSWORD) {
      return Response.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }
    const { blobs } = await store.list();
    const items = await Promise.all(blobs.map((x) => store.get(x.key, { type: "json" })));
    items.sort((a, b) => b.fecha.localeCompare(a.fecha));
    return Response.json(items);
  }

  return new Response("Método no permitido", { status: 405 });
};

export const config = { path: "/api/respuestas" };
