import { useEffect, useState } from "react";
import { wczytajPlik } from "../lib/dane";
import { GITHUB, renderujMarkdown } from "../lib/markdown";
import { Link, Notka } from "./ui";

/** Plik markdown z repo, renderowany na stronie. `wytnij` pozwala pokazać tylko fragment (np. sam tekst). */
export function PlikMarkdown({ sciezka, wytnij, className = "md" }: { sciezka: string; wytnij?: (md: string) => string | null; className?: string }) {
  const [stan, setStan] = useState<{ html: string } | { blad: string } | null>(null);
  useEffect(() => {
    let aktywny = true;
    setStan(null);
    wczytajPlik(sciezka)
      .then((md) => {
        const fragment = wytnij ? wytnij(md) : md;
        if (fragment === null) throw new Error("nie znalazłem fragmentu w pliku");
        if (aktywny) setStan({ html: renderujMarkdown(fragment, sciezka) });
      })
      .catch((e: Error) => aktywny && setStan({ blad: e.message }));
    return () => {
      aktywny = false;
    };
  }, [sciezka, wytnij]);

  if (!stan) return <p className="text-sm text-muted">Wczytuję {sciezka}…</p>;
  if ("blad" in stan)
    return (
      <Notka ton="blad">
        Nie udało się otworzyć <code>{sciezka}</code> ({stan.blad}). <Link href={GITHUB + sciezka}>Otwórz na GitHubie</Link>
      </Notka>
    );
  return <div className={className} dangerouslySetInnerHTML={{ __html: stan.html }} />;
}
