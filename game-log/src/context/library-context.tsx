"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LibraryEntry, SharedList } from "@/types/library";

const STORAGE_KEY = "game-log:library:v2";
const STORAGE_KEY_V1 = "game-log:library:v1";
const SHARED_KEY = "game-log:shared-lists:v1";

type LibraryState = Record<number, LibraryEntry>;

type LegacyV1Entry = Omit<LibraryEntry, "igdbId"> & { rawgId: number };

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function migrateFromV1(raw: Record<string, unknown>): LibraryState {
  const out: LibraryState = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!val || typeof val !== "object") continue;
    const e = val as Partial<LegacyV1Entry> & Partial<LibraryEntry>;
    const id =
      typeof e.igdbId === "number"
        ? e.igdbId
        : typeof e.rawgId === "number"
          ? e.rawgId
          : Number(key);
    if (!Number.isFinite(id)) continue;
    const {
      updatedAt,
      name,
      backgroundImage,
      developerName,
      rating,
      playMode,
      modded,
      status,
      completedWith,
      linkedSharedListId,
    } = e;
    if (
      typeof name !== "string" ||
      typeof rating !== "number" ||
      typeof playMode !== "string" ||
      typeof modded !== "boolean" ||
      typeof status !== "string" ||
      typeof updatedAt !== "string"
    ) {
      continue;
    }
    out[id] = {
      igdbId: id,
      name,
      backgroundImage:
        typeof backgroundImage === "string" || backgroundImage === null
          ? backgroundImage
          : null,
      developerName:
        typeof developerName === "string" || developerName === null
          ? developerName
          : null,
      rating,
      playMode: playMode as LibraryEntry["playMode"],
      modded,
      status: status as LibraryEntry["status"],
      completedWith:
        typeof completedWith === "string" ? completedWith : undefined,
      linkedSharedListId:
        typeof linkedSharedListId === "string"
          ? linkedSharedListId
          : undefined,
      updatedAt,
    };
  }
  return out;
}

function loadLibraryState(): LibraryState {
  const v2 = loadJson<LibraryState | Record<string, unknown>>(
    STORAGE_KEY,
    {},
  );
  if (v2 && typeof v2 === "object" && Object.keys(v2).length > 0) {
    const first = Object.values(v2)[0] as Record<string, unknown> | undefined;
    if (first && typeof first.igdbId === "number") {
      return v2 as LibraryState;
    }
    return migrateFromV1(v2 as Record<string, unknown>);
  }
  const v1 = loadJson<Record<string, unknown>>(STORAGE_KEY_V1, {});
  if (v1 && Object.keys(v1).length > 0) {
    return migrateFromV1(v1);
  }
  return {};
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type LibraryContextValue = {
  entries: LibraryEntry[];
  sharedLists: SharedList[];
  upsertEntry: (entry: Omit<LibraryEntry, "updatedAt"> & { updatedAt?: string }) => void;
  removeEntry: (igdbId: number) => void;
  createSharedList: (title: string, partnerName: string) => SharedList;
  deleteSharedList: (id: string) => void;
  getEntry: (igdbId: number) => LibraryEntry | undefined;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [byId, setById] = useState<LibraryState>({});
  const [sharedLists, setSharedLists] = useState<SharedList[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setById(loadLibraryState());
      setSharedLists(loadJson(SHARED_KEY, []));
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(byId));
  }, [byId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SHARED_KEY, JSON.stringify(sharedLists));
  }, [sharedLists, hydrated]);

  const entries = useMemo(
    () =>
      Object.values(byId).sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      ),
    [byId],
  );

  const upsertEntry = useCallback(
    (entry: Omit<LibraryEntry, "updatedAt"> & { updatedAt?: string }) => {
      const updatedAt = entry.updatedAt ?? new Date().toISOString();
      setById((prev) => ({
        ...prev,
        [entry.igdbId]: { ...entry, updatedAt },
      }));
    },
    [],
  );

  const removeEntry = useCallback((igdbId: number) => {
    setById((prev) => {
      const next = { ...prev };
      delete next[igdbId];
      return next;
    });
  }, []);

  const createSharedList = useCallback((title: string, partnerName: string) => {
    const list: SharedList = {
      id: newId(),
      title: title.trim() || "Lista compartida",
      partnerName: partnerName.trim(),
      createdAt: new Date().toISOString(),
    };
    setSharedLists((prev) => [list, ...prev]);
    return list;
  }, []);

  const deleteSharedList = useCallback((id: string) => {
    setSharedLists((prev) => prev.filter((l) => l.id !== id));
    setById((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        const e = next[Number(key)];
        if (e?.linkedSharedListId === id) {
          next[Number(key)] = { ...e, linkedSharedListId: undefined };
        }
      }
      return next;
    });
  }, []);

  const getEntry = useCallback(
    (igdbId: number) => byId[igdbId],
    [byId],
  );

  const value = useMemo(
    () => ({
      entries,
      sharedLists,
      upsertEntry,
      removeEntry,
      createSharedList,
      deleteSharedList,
      getEntry,
    }),
    [
      entries,
      sharedLists,
      upsertEntry,
      removeEntry,
      createSharedList,
      deleteSharedList,
      getEntry,
    ],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary debe usarse dentro de LibraryProvider");
  }
  return ctx;
}
