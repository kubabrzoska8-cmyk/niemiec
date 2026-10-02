import fs from "node:fs";
import { fileURLToPath } from "node:url";

export const KORZEN = fileURLToPath(new URL("../..", import.meta.url));
export const czytaj = (sciezka: string) => fs.readFileSync(KORZEN + sciezka, "utf8");
export const kursSurowy = () => JSON.parse(czytaj("data/kurs.json"));

/** fetch, który czyta pliki z repo przez prawdziwą logikę middleware (bez serwera HTTP). */
export async function fetchZRepo(url: string): Promise<Response> {
  const { rozwiaz } = await import("../serwer-repo");
  const cel = rozwiaz(KORZEN, url);
  if (!cel) return new Response("zabronione", { status: 403 });
  if (cel.typ === "katalog") {
    const pliki = fs.readdirSync(cel.bezwzgledna).filter((p) => /\.(tsv|md|json)$/.test(p)).sort();
    return new Response(JSON.stringify({ pliki }));
  }
  return fs.existsSync(cel.bezwzgledna) ? new Response(fs.readFileSync(cel.bezwzgledna, "utf8")) : new Response("", { status: 404 });
}
