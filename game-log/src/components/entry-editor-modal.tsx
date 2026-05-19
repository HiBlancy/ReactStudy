"use client";

import { useState } from "react";
import type { LibraryEntry } from "@/types/library";
import { useLibrary } from "@/context/library-context";

type Props = {
  gameName: string;
  variant: "add" | "edit";
  draft: Omit<LibraryEntry, "updatedAt">;
  onClose: () => void;
  onSave: (entry: Omit<LibraryEntry, "updatedAt">) => void;
};

export function EntryEditorModal({
  gameName,
  variant,
  draft,
  onClose,
  onSave,
}: Props) {
  const { sharedLists } = useLibrary();
  const [rating, setRating] = useState(draft.rating);
  const [playMode, setPlayMode] = useState(draft.playMode);
  const [modded, setModded] = useState(draft.modded);
  const [status, setStatus] = useState(draft.status);
  const [completedWith, setCompletedWith] = useState(
    draft.completedWith ?? "",
  );
  const [linkedSharedListId, setLinkedSharedListId] = useState(
    draft.linkedSharedListId ?? "",
  );

  const handleSave = () => {
    const trimmedBuddy = completedWith.trim();
    onSave({
      igdbId: draft.igdbId,
      name: draft.name,
      backgroundImage: draft.backgroundImage,
      developerName: draft.developerName,
      rating,
      playMode,
      modded,
      status,
      completedWith:
        status === "completed" && playMode === "with_someone" && trimmedBuddy
          ? trimmedBuddy
          : undefined,
      linkedSharedListId:
        status === "completed" &&
        playMode === "with_someone" &&
        linkedSharedListId
          ? linkedSharedListId
          : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="panel-title" className="text-lg font-semibold">
              {variant === "add" ? "Añadir a tu lista" : "Editar en tu lista"}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {gameName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 text-sm">
          <label className="flex flex-col gap-1 font-medium">
            Puntuación (1–10)
            <input
              type="range"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
            <span className="text-xs font-normal text-zinc-500">
              Valor actual: {rating}
            </span>
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="font-medium">Cómo lo juegas</legend>
            <label className="flex items-center gap-2 font-normal">
              <input
                type="radio"
                name="playMode"
                checked={playMode === "solo"}
                onChange={() => setPlayMode("solo")}
              />
              Solo
            </label>
            <label className="flex items-center gap-2 font-normal">
              <input
                type="radio"
                name="playMode"
                checked={playMode === "with_someone"}
                onChange={() => setPlayMode("with_someone")}
              />
              Con alguien (local u online)
            </label>
          </fieldset>

          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={modded}
              onChange={(e) => setModded(e.target.checked)}
            />
            He usado mods en este juego
          </label>

          <label className="flex flex-col gap-1 font-medium">
            Estado
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as LibraryEntry["status"])
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="wishlist">Lista de deseos</option>
              <option value="playing">Jugando</option>
              <option value="completed">Completado</option>
            </select>
          </label>

          {status === "completed" && playMode === "with_someone" && (
            <>
              <label className="flex flex-col gap-1 font-medium">
                ¿Con quién lo completaste?
                <input
                  value={completedWith}
                  onChange={(e) => setCompletedWith(e.target.value)}
                  placeholder="Nombre o apodo de la persona"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="flex flex-col gap-1 font-medium">
                Asociar a lista compartida (opcional)
                <select
                  value={linkedSharedListId}
                  onChange={(e) => setLinkedSharedListId(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">— Ninguna —</option>
                  {sharedLists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} (con {l.partnerName})
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-zinc-500">
                Crea listas en &quot;Listas compartidas&quot;. Cuando tengáis
                cuentas reales, podréis sincronizar esta vista entre
                dispositivos.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
