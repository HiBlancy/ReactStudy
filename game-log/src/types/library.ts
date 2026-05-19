/** Entrada en tu biblioteca local (persistida en el navegador). */
export type PlayMode = "solo" | "with_someone";

export type GameStatus = "wishlist" | "playing" | "completed";

export type LibraryEntry = {
  /** ID del juego en IGDB (antes se usaba RAWG). */
  igdbId: number;
  name: string;
  backgroundImage: string | null;
  developerName: string | null;
  /** Puntuación personal 1–10 */
  rating: number;
  playMode: PlayMode;
  /** Si has usado mods en algún momento */
  modded: boolean;
  status: GameStatus;
  /**
   * Si lo marcas completado y jugaste con alguien en concreto,
   * guarda su nombre o apodo (más adelante podría enlazarse a usuarios reales).
   */
  completedWith?: string;
  /** Lista compartida a la que asocias este juego completado en co-op */
  linkedSharedListId?: string;
  updatedAt: string;
};

/** Lista compartida: espacio “yo + otra persona” para ver juegos terminados juntos. */
export type SharedList = {
  id: string;
  title: string;
  /** Nombre/apodo del compañero (en un futuro: cuenta de otro usuario) */
  partnerName: string;
  createdAt: string;
};

/** Resumen devuelto por `/api/games/search` (compatible con tarjetas de explorar). */
export type ApiGameSummary = {
  id: number;
  name: string;
  background_image: string | null;
  developers?: { name: string }[];
};
