"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ApiGameSummary, LibraryEntry } from "@/types/library";
import { useLibrary } from "@/context/library-context";
import { EntryEditorModal } from "@/components/entry-editor-modal";

type SearchResponse = {
  results: ApiGameSummary[];
  mock?: boolean;
  error?: string;
};

function defaultEntryFromGame(g: ApiGameSummary): Omit<LibraryEntry, "updatedAt"> {
  return {
    igdbId: g.id,
    name: g.name,
    backgroundImage: g.background_image,
    developerName: g.developers?.[0]?.name ?? null,
    rating: 7,
    playMode: "solo",
    modded: false,
    status: "playing",
  };
}

export function ExploreClient() {
  const { upsertEntry, getEntry } = useLibrary();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiGameSummary[]>([]);
  const [mock, setMock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApiGameSummary | null>(null);

  async function runSearch(query: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/games/search?q=${encodeURIComponent(query.trim())}`,
      );
      const data = (await res.json()) as SearchResponse;
      if (!res.ok) {
        setError(data.error ?? "Error al buscar");
        setResults([]);
        return;
      }
      setResults(data.results ?? []);
      setMock(Boolean(data.mock));
    } catch {
      setError("No se pudo conectar con el servidor");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void runSearch("");
    });
  }, []);

  const existing = selected ? getEntry(selected.id) : undefined;
  const draftForModal = useMemo(() => {
    if (!selected) return null;
    return existing ?? defaultEntryFromGame(selected);
  }, [selected, existing]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Explorar juegos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Busca en la base de datos de{" "}
          <a
            href="https://www.igdb.com/"
            className="font-medium text-emerald-800 underline dark:text-emerald-400"
            target="_blank"
            rel="noreferrer"
          >
            IGDB
          </a>{" "}
          (vía Twitch). Sin credenciales en el servidor verás unos pocos juegos
          de ejemplo.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Buscador
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void runSearch(q)}
            placeholder="Ej: Hollow Knight, Zelda…"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <button
          type="button"
          onClick={() => void runSearch(q)}
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </div>

      {mock && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          Modo demostración: configura{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/80">
            TWITCH_CLIENT_ID
          </code>{" "}
          y{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/80">
            TWITCH_CLIENT_SECRET
          </code>{" "}
          en{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/80">
            .env.local
          </code>{" "}
          (app en{" "}
          <a
            href="https://dev.twitch.tv/console/apps"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            Twitch Developer
          </a>
          , ver README).
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((g) => {
          const inLib = Boolean(getEntry(g.id));
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelected(g)}
              className={`flex flex-col overflow-hidden rounded-xl border text-left transition hover:border-zinc-400 hover:shadow-md dark:hover:border-zinc-600 ${
                selected?.id === g.id
                  ? "border-zinc-900 ring-2 ring-zinc-900 dark:border-zinc-100 dark:ring-zinc-100"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                {g.background_image ? (
                  <Image
                    src={g.background_image}
                    alt={g.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-zinc-500">
                    Sin imagen
                  </div>
                )}
                {inLib && (
                  <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                    En tu lista
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 p-3">
                <span className="font-medium leading-snug">{g.name}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {g.developers?.[0]?.name ?? "Estudio desconocido"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && draftForModal && (
        <EntryEditorModal
          key={selected.id}
          gameName={selected.name}
          variant={existing ? "edit" : "add"}
          draft={draftForModal}
          onClose={() => setSelected(null)}
          onSave={(entry) => {
            upsertEntry(entry);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
