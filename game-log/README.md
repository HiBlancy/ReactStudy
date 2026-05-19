# Game Log (Next.js)

Aplicación para aprender **Next.js (App Router)** mientras construyes un registro de juegos:

- **Explorar**: búsqueda vía **IGDB** (Internet Game Database) a través de la API de Twitch, con datos de demostración si no configuras credenciales.
- **Biblioteca**: puntuación 1–10, solo / con alguien, si usaste **mods**, estado (deseos / jugando / completado).
- **Completado en co-op**: nombre de la persona y enlace opcional a una **lista compartida** (por ahora todo en `localStorage` del navegador).

## Arranque

```bash
cd game-log
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Credenciales Twitch / IGDB

IGDB no usa una clave única: necesitas una **aplicación en Twitch** y OAuth *client credentials*.

1. Entra en [Twitch Developer — Applications](https://dev.twitch.tv/console/apps) y crea una app.
2. Copia el **Client ID** y genera un **Client Secret**.
3. En la carpeta `game-log`, crea `.env.local` (puedes partir de `.env.example`):

```env
TWITCH_CLIENT_ID=tu_client_id
TWITCH_CLIENT_SECRET=tu_client_secret
```

4. Reinicia `npm run dev`. La ruta `/api/games/search` obtendrá un token de acceso y consultará `https://api.igdb.com/v4/games`.

Documentación oficial: [IGDB API](https://api-docs.igdb.com/).

## Migración desde RAWG

Si ya tenías datos guardados con la versión anterior, al cargar la app se **migra** automáticamente desde `game-log:library:v1` a `game-log:library:v2` (el campo `rawgId` pasa a llamarse `igdbId`). Los IDs numéricos antiguos de RAWG **no coinciden** con los de IGDB: conviene revisar o volver a añadir juegos desde Explorar.

## Estructura útil para estudiar

| Ruta / archivo | Qué mirar |
|----------------|-----------|
| `src/app/page.tsx` | Página principal (tu biblioteca). |
| `src/app/explorar/` | Cliente que llama a `fetch` contra la API interna. |
| `src/app/api/games/search/route.ts` | Route Handler: IGDB + modo mock. |
| `src/lib/igdb.ts` | Token de Twitch + consulta a IGDB v4. |
| `src/context/library-context.tsx` | Estado global + persistencia en `localStorage`. |
| `src/components/entry-editor-modal.tsx` | Formulario reutilizable (modal). |

## Próximos pasos posibles

- Autenticación (Auth.js / Clerk) y base de datos para listas compartidas entre usuarios reales.
- Paginación u *offset* en la búsqueda IGDB y ficha de detalle (`/v4/games` con más campos).
- Tests con Playwright o Vitest.
