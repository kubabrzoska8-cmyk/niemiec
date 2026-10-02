import { useEffect, useState } from "react";

export type Motyw = "system" | "light" | "dark";
const KLUCZ = "niemiec-motyw";

function zapisany(): Motyw {
  try {
    const m = localStorage.getItem(KLUCZ);
    return m === "light" || m === "dark" ? m : "system";
  } catch {
    return "system";
  }
}

/** Jasny / ciemny / jak w systemie. Wybór zostaje w tej przeglądarce. */
export function useMotyw(): [Motyw, () => void] {
  const [motyw, setMotyw] = useState<Motyw>(zapisany);
  useEffect(() => {
    const html = document.documentElement;
    if (motyw === "system") delete html.dataset.theme;
    else html.dataset.theme = motyw;
    try {
      if (motyw === "system") localStorage.removeItem(KLUCZ);
      else localStorage.setItem(KLUCZ, motyw);
    } catch {
      /* tryb prywatny — motyw tylko do odświeżenia */
    }
  }, [motyw]);
  const nastepny = () => setMotyw((m) => (m === "system" ? "light" : m === "light" ? "dark" : "system"));
  return [motyw, nastepny];
}
