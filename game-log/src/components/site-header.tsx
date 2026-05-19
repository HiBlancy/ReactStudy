import Link from "next/link";

const links = [
  { href: "/", label: "Mi biblioteca" },
  { href: "/explorar", label: "Explorar juegos" },
  { href: "/compartido", label: "Listas compartidas" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Game Log
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm font-medium">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-transparent px-3 py-1.5 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
