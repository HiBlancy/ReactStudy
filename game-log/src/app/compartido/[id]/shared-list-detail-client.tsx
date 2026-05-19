"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useLibrary } from "@/context/library-context";

export function SharedListDetailClient({ listId }: { listId: string }) {
  const { entries, sharedLists } = useLibrary();
  const list = sharedLists.find((l) => l.id === listId);

  const games = useMemo(() => {
    if (!list) return [];
    return entries.filter(
      (e) =>
        e.status === "completed" &&
        e.linkedSharedListId === list.id &&
        e.playMode === "with_someone",
    );
  }, [entries, list]);

  if (!list) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          No existe esa lista.{" "}
          <Link href="/compartido" className="text-emerald-700 underline dark:text-emerald-400">
            Volver
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div>
        <Link
          href="/compartido"
          className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← Listas compartidas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {list.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Juegos que marcaste como completados en co-op y vinculaste a esta
          lista (con {list.partnerName}).
        </p>
      </div>

      {games.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Aún no hay juegos en esta vista. Completa un juego en modo &quot;Con
          alguien&quot;, indica con quién y elige esta lista en el desplegable
          de lista compartida.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {games.map((g) => (
            <li
              key={g.igdbId}
              className="flex gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
                {g.backgroundImage ? (
                  <Image
                    src={g.backgroundImage}
                    alt={g.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                ) : null}
              </div>
              <div>
                <p className="font-medium">{g.name}</p>
                <p className="text-xs text-zinc-500">
                  Completado con: {g.completedWith ?? list.partnerName} · Nota{" "}
                  {g.rating}/10
                  {g.modded ? " · Con mods" : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
