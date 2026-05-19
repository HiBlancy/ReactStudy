"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLibrary } from "@/context/library-context";

export function CompartidoIndexClient() {
  const { sharedLists, createSharedList, deleteSharedList } = useLibrary();
  const [title, setTitle] = useState("");
  const [partner, setPartner] = useState("");

  const sorted = useMemo(
    () =>
      [...sharedLists].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    [sharedLists],
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Listas compartidas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Crea un espacio &quot;yo + compañero/a&quot; para agrupar juegos que
          marques como completados juntos. Por ahora es local a tu navegador; el
          siguiente paso natural es autenticación y una API para que dos
          cuentas vean la misma lista.
        </p>
      </div>

      <form
        className="flex max-w-xl flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        onSubmit={(e) => {
          e.preventDefault();
          if (!partner.trim()) {
            alert("Escribe el nombre o apodo de tu compañero/a.");
            return;
          }
          createSharedList(
            title.trim() || `Con ${partner.trim()}`,
            partner.trim(),
          );
          setTitle("");
          setPartner("");
        }}
      >
        <h2 className="text-sm font-semibold">Nueva lista</h2>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Título (opcional)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Co-op 2026"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Nombre del compañero / compañera
          <input
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
            placeholder="Ej: Ana"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <button
          type="submit"
          className="mt-1 w-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Crear lista
        </button>
      </form>

      <div>
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Tus listas
        </h2>
        {sorted.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Aún no hay listas. Crea una y luego, al completar un juego en
            co-op, asígnalo a esta lista desde el formulario de edición.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {sorted.map((list) => (
              <li
                key={list.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <div>
                  <Link
                    href={`/compartido/${list.id}`}
                    className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    {list.title}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    Compañero/a: {list.partnerName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "¿Eliminar esta lista? Los juegos en tu biblioteca no se borran, solo se desvincula la lista.",
                      )
                    ) {
                      deleteSharedList(list.id);
                    }
                  }}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
