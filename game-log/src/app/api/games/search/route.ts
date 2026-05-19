import { NextRequest, NextResponse } from "next/server";
import type { ApiGameSummary } from "@/types/library";
import { searchIgdbGames } from "@/lib/igdb";

const MOCK: ApiGameSummary[] = [
  {
    id: 1942,
    name: "The Witcher 3: Wild Hunt",
    background_image:
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
    developers: [{ name: "CD Projekt RED" }],
  },
  {
    id: 1907,
    name: "The Elder Scrolls V: Skyrim",
    background_image:
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tnw.jpg",
    developers: [{ name: "Bethesda Game Studios" }],
  },
  {
    id: 28540,
    name: "Hades",
    background_image:
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r0o.jpg",
    developers: [{ name: "Supergiant Games" }],
  },
];

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  const hasTwitchCreds =
    Boolean(process.env.TWITCH_CLIENT_ID) &&
    Boolean(process.env.TWITCH_CLIENT_SECRET);

  if (!hasTwitchCreds) {
    if (!q) {
      return NextResponse.json({ results: MOCK, mock: true });
    }
    const lower = q.toLowerCase();
    const filtered = MOCK.filter((g) => g.name.toLowerCase().includes(lower));
    return NextResponse.json({
      results: filtered.length ? filtered : MOCK,
      mock: true,
    });
  }

  const igdb = await searchIgdbGames(q);
  if (!igdb.ok) {
    if (igdb.status === 503 && igdb.message === "missing_credentials") {
      return NextResponse.json(
        { results: MOCK, mock: true, error: "Credenciales incompletas" },
        { status: 200 },
      );
    }
    return NextResponse.json(
      {
        error: "IGDB no disponible",
        status: igdb.status,
      },
      { status: 502 },
    );
  }
  console.log("📦 TWITCH_CLIENT_ID existe?", !!process.env.TWITCH_CLIENT_ID);
  console.log("📦 TWITCH_CLIENT_SECRET existe?", !!process.env.TWITCH_CLIENT_SECRET);

  return NextResponse.json({ results: igdb.games, mock: false });
}
