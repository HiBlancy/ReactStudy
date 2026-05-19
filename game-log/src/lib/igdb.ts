/**
 * Cliente mínimo para IGDB v4 (requiere app en Twitch Developer + Client ID/Secret).
 * @see https://api-docs.igdb.com/
 */

import type { ApiGameSummary } from "@/types/library";

type IgdbGameRow = {
  id: number;
  name: string;
  cover?: { url?: string } | null;
  involved_companies?: { company?: { name?: string } }[];
};

let tokenCache: { value: string; expiresAt: number } | null = null;

export async function getTwitchAppAccessToken(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  console.log("🔐 getToken - clientId:", clientId ? "✅" : "❌");
  console.log("🔐 getToken - clientSecret:", clientSecret ? "✅" : "❌");

  if (!clientId || !clientSecret) return null;

  if (tokenCache && Date.now() < tokenCache.expiresAt - 120_000) {
    console.log("♻️ Usando token cacheado");
    return tokenCache.value;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  console.log("📡 Solicitando token a Twitch...");
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  console.log("📡 Respuesta Twitch status:", res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Error token Twitch:", errorText);
    return null;
  }

  const data = await res.json();
  console.log("✅ Token obtenido, expires_in:", data.expires_in);
  tokenCache = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

function normalizeCoverUrl(url: string | undefined): string | null {
  if (!url) return null;
  // Reemplaza el tamaño thumbnail por cover_big (mejor calidad)
  let fixedUrl = url.replace('t_thumb', 't_cover_big');
  if (fixedUrl.startsWith("//")) return `https:${fixedUrl}`;
  if (fixedUrl.startsWith("http")) return fixedUrl;
  return `https://${fixedUrl}`;
}

export function igdbGameToSummary(game: IgdbGameRow): ApiGameSummary {
  const developerName =
    game.involved_companies?.find((ic) => ic.company?.name)?.company?.name ??
    undefined;

  return {
    id: game.id,
    name: game.name,
    background_image: normalizeCoverUrl(game.cover?.url),
    developers: developerName ? [{ name: developerName }] : undefined,
  };
}

function escapeSearchTerm(q: string): string {
  return q.replace(/"/g, "").replace(/\n/g, " ").trim();
}

/**
 * Búsqueda por texto, o catálogo popular si `searchQuery` está vacío.
 */
export async function searchIgdbGames(searchQuery: string) {
  console.log("🔍 searchIgdbGames called with query:", searchQuery);
  const clientId = process.env.TWITCH_CLIENT_ID;
  const token = await getTwitchAppAccessToken();

  console.log("🔍 clientId:", !!clientId, "token:", !!token);

  if (!clientId || !token) {
    console.log("❌ Retornando missing_credentials");
    return { ok: false, status: 503, message: "missing_credentials" };
  }

  const term = escapeSearchTerm(searchQuery);
  const body = term
  ? `search "${term}";
fields name,cover.url,involved_companies.company.name;
limit 24;`   // ✅ eliminado where category y version_parent
  : `fields name,cover.url,involved_companies.company.name;
sort popularity desc;
limit 24;`;

  console.log("📤 Body enviado a IGDB:", body);

  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  console.log("📥 IGDB response status:", res.status);
  if (!res.ok) {
    const text = await res.text();
    console.error("❌ IGDB error:", text);
    return { ok: false, status: res.status, message: text };
  }

  const rows = await res.json();
  console.log("✅ IGDB éxito, juegos recibidos:", rows.length);
  return { ok: true, games: rows.map(igdbGameToSummary) };
}
