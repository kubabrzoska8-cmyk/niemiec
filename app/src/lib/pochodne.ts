/** Liczby wyprowadzone z kurs.json, wspólne dla kilku zakładek. */
import type { Kurs, SesjaT } from "./schema";

export function etap1(k: Kurs) {
  return k.kurs.etapy.find((e) => e.nr === 1)!;
}

export function ostatniaSesja(k: Kurs): SesjaT {
  return k.sesje[k.sesje.length - 1];
}

/** Czy plan lekcji wolno pokazać: tylko sesje już przeprowadzone — plan następnej ma pytania i klucze. */
export function lekcjaOdkryta(k: Kurs, nr: number): boolean {
  return nr <= ostatniaSesja(k).nr;
}

/** Teksty, które Jakub dostał i które można przeczytać jeszcze raz. */
export function tekstyDoCzytania(k: Kurs) {
  return k.teksty.filter((t) => t.status === "przeczytany" || t.status === "czytany-na-sesji" || t.status === "wyslany");
}

export const NAZWA_TRYBU: Record<SesjaT["tryb"], string> = {
  "przed-struktura": "przed strukturą kursu",
  erhaltungsmodus: "🧊 Erhaltungsmodus",
  vollmodus: "🔥 Vollmodus",
};
