import { useEffect, useState } from "react";

/** Trasa z hasha: „#/tematy/05-genus.md” → ["tematy", "05-genus.md"]. Hash działa bez serwera tras. */
export function czytajTrase(hash: string): string[] {
  return hash
    .replace(/^#\/?/, "")
    .split("/")
    .filter(Boolean)
    .map((c) => {
      try {
        return decodeURIComponent(c);
      } catch {
        return c;
      }
    });
}

export function useTrasa(): string[] {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const f = () => setHash(window.location.hash);
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return czytajTrase(hash);
}
