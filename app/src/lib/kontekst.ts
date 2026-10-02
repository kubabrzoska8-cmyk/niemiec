import { createContext, useContext } from "react";
import type { Kurs } from "./schema";

export interface Stan {
  kurs: Kurs;
  /** Dzisiejsza data RRRR-MM-DD — z zegara albo z `?dzis=` w adresie (do sprawdzania liczb). */
  dzis: string;
}

export const KursKontekst = createContext<Stan | null>(null);

export function useKurs(): Stan {
  const s = useContext(KursKontekst);
  if (!s) throw new Error("useKurs poza KursKontekst");
  return s;
}
