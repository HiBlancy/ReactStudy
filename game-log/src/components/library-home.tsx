"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { LibraryEntry } from "@/types/library";
import { useLibrary } from "@/context/library-context";
import { EntryEditorModal } from "@/components/entry-editor-modal";


function toDraft(entry: LibraryEntry): Omit<LibraryEntry, "updatedAt"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- quitamos updatedAt del objeto guardado
  const { updatedAt, ...rest } = entry;
  return rest;
}

const statusLabel: Record<LibraryEntry["status"], string> = {
  wishlist: "Deseos",
  playing: "Jugando",
  completed: "Completado",
};

export function LibraryHome() {
  const { entries, upsertEntry, removeEntry, sharedLists } = useLibrary();
  const [editing, setEditing] = useState<LibraryEntry | null>(null);

  const counts = useMemo(() => {
    return entries.reduce(
      (acc, e) => {
        acc[e.status] += 1;
        return acc;
      },
      { wishlist: 0, playing: 0, completed: 0 },
    );
  }, [entries]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tu biblioteca
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Los datos se guardan solo en este navegador (
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
              localStorage
            </code>
            ). Más adelante podrás sustituirlo por una base de datos y cuentas
            de usuario.
          </p>
        </div>
        <Link
          href="/explorar"
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Explorar y añadir juegos
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-900">
          Deseos: {counts.wishlist}
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-900">
          Jugando: {counts.playing}
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-900">
          Completados: {counts.completed}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            Aún no has añadido juegos. Ve a{" "}
            <Link href="/explorar" className="font-medium text-emerald-700 underline dark:text-emerald-400">
              Explorar juegos
            </Link>{" "}
            para buscar en IGDB y crea tu primera entrada.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li
              key={entry.igdbId}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 sm:flex-row sm:items-center dark:border-zinc-800"
            >
              <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900 sm:w-[4.5rem]">
                {entry.backgroundImage ? (
                  <Image
                    src={entry.backgroundImage}
                    alt={entry.name}
                    fill
                    className="object-contain"  // en lugar de object-cover
                    sizes="72px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-zinc-500">
                    —
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{entry.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.developerName ?? "Estudio desconocido"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-900">
                    {statusLabel[entry.status]}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-900">
                    Nota: {entry.rating}/10
                  </span>

                  {/* Badge de modo de juego con nombre del compañero si existe */}
                  {entry.playMode === "solo" ? (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-900">Solo</span>
                  ) : (
                    (() => {
                      // Buscar el nombre: priorizar lista compartida, luego completedWith
                      let partnerName = null;
                      if (entry.linkedSharedListId) {
                        const found = sharedLists.find(list => list.id === entry.linkedSharedListId);
                        partnerName = found?.partnerName ?? null;
                      }
                      if (!partnerName && entry.completedWith) {
                        partnerName = entry.completedWith;
                      }
                      return partnerName ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                          Con {partnerName}
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-900">
                          Con alguien
                        </span>
                      );
                    })()
                  )}

                  {entry.modded && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-900 dark:bg-violet-950 dark:text-violet-200">
                      Mods
                    </span>
                  )}
                </div>

              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(entry)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `¿Quitar «${entry.name}» de tu biblioteca?`,
                      )
                    ) {
                      removeEntry(entry.igdbId);
                    }
                  }}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )
      }

      {
        editing && (
          <EntryEditorModal
            key={editing.igdbId}
            gameName={editing.name}
            variant="edit"
            draft={toDraft(editing)}
            onClose={() => setEditing(null)}
            onSave={(e) => {
              upsertEntry(e);
              setEditing(null);
            }}
          />
        )
      }
    </div >
  );
}
