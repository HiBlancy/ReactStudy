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
  if (!clientId || !clientSecret) return null;

  if (tokenCache && Date.now() < tokenCache.expiresAt - 120_000) {
    return tokenCache.value;
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

function normalizeCoverUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) return url;
  return `https://${url}`;
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
export async function searchIgdbGames(
  searchQuery: string,
): Promise<
  | { ok: true; games: ApiGameSummary[] }
  | { ok: false; status: number; message: string }
> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const token = await getTwitchAppAccessToken();

  if (!clientId || !token) {
    return { ok: false, status: 503, message: "missing_credentials" };
  }

  const term = escapeSearchTerm(searchQuery);
  const body = term
    ? `search "${term}";
fields name,cover.url,involved_companies.company.name;
where category = 0 & version_parent = null;
limit 24;`
    : `fields name,cover.url,involved_companies.company.name;
where category = 0 & version_parent = null;
sort total_rating_count desc;
limit 24;`;

  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      status: res.status,
      message: text || res.statusText,
    };
  }

  const rows = (await res.json()) as IgdbGameRow[];
  return { ok: true, games: rows.map(igdbGameToSummary) };
}
