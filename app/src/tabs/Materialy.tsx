import { useCallback } from "react";
import { PlikMarkdown } from "../components/Markdown";
import { Karta, Link, Md, Notka, Plakietka, Tytul } from "../components/ui";
import { dataDluga } from "../lib/daty";
import { useKurs } from "../lib/kontekst";
import { GITHUB, wyciagnijTekst } from "../lib/markdown";
import { lekcjaOdkryta, tekstyDoCzytania } from "../lib/pochodne";
import type { Kurs } from "../lib/schema";
import type { WidokProps } from "./typy";

const STATUS: Record<Kurs["teksty"][number]["status"], string> = {
  przeczytany: "przeczytany w domu",
  "czytany-na-sesji": "czytany na sesji",
  wyslany: "do przeczytania przed sesją",
  nieprzeczytany: "nieprzeczytany",
  wycofany: "wycofany",
};

function NieJestPomiarem() {
  return (
    <Notka ton="uwaga">
      Ćwiczenia z planów lekcji, zrobione tutaj, <strong>nie są pomiarem kursu</strong> — pomiar dzieje się tylko na lekcji, przy nowych zdaniach.
      Klucze są w planach jawne.
    </Notka>
  );
}

function Wstecz() {
  return (
    <a href="#/materialy" className="text-sm text-accent-ink hover:underline">
      ← Materiały
    </a>
  );
}

function Lekcja({ nr }: { nr: number }) {
  const { kurs: k } = useKurs();
  const s = k.sesje.find((x) => x.nr === nr);
  const sciezka = s?.lekcja ?? (k.nastepna_sesja.nr === nr ? k.nastepna_sesja.lekcja : null);
  if (!lekcjaOdkryta(k, nr))
    return (
      <div className="space-y-4">
        <Wstecz />
        <h1 className="text-2xl font-semibold">Sesja {nr}</h1>
        <Notka>
          🔒 Plan sesji {nr} jest ukryty do lekcji — zawiera pytania do tekstu, luki i klucze. Pokaże się tutaj, kiedy sesja {nr} trafi do logu.
        </Notka>
      </div>
    );
  return (
    <div className="space-y-4">
      <Wstecz />
      {s && (
        <p className="text-sm text-muted">
          Sesja {s.nr} · {dataDluga(s.data)}
        </p>
      )}
      <NieJestPomiarem />
      {sciezka ? (
        <Karta>
          <div className="mb-2 flex justify-end text-xs">
            <Link href={GITHUB + sciezka}>{sciezka} na GitHubie</Link>
          </div>
          <PlikMarkdown sciezka={sciezka} />
        </Karta>
      ) : (
        <Notka>Ta sesja nie ma pliku planu lekcji (sesje 1–4 odbyły się przed strukturą kursu).</Notka>
      )}
    </div>
  );
}

function Tekst({ nr }: { nr: number }) {
  const { kurs: k } = useKurs();
  const t = tekstyDoCzytania(k).find((x) => x.sesja === nr);
  const wytnij = useCallback((md: string) => (t ? wyciagnijTekst(md, t.naglowek) : null), [t]);
  if (!t)
    return (
      <div className="space-y-4">
        <Wstecz />
        <Notka>Nie ma tekstu do czytania dla sesji {nr}.</Notka>
      </div>
    );
  return (
    <div className="space-y-4">
      <Wstecz />
      <div>
        <p className="text-sm text-muted">
          Lesestück · sesja {t.sesja} · {t.gatunek}
        </p>
        <h1 className="text-2xl font-semibold" lang="de">
          {t.tytul}
        </h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Plakietka ton={t.status === "wyslany" ? "akcent" : "neutral"}>{STATUS[t.status]}</Plakietka>
          {t.uwaga && <span className="text-xs text-muted">{t.uwaga}</span>}
        </div>
      </div>
      <Karta>
        <div lang="de">
          <PlikMarkdown sciezka={t.plik} wytnij={wytnij} className="md lektura" />
        </div>
      </Karta>
      <p className="text-xs text-muted">
        Nieznane słowa zgaduj z kontekstu — nie tłumacz słowo po słowie. Pytania do tekstu dostajesz dopiero na sesji.
      </p>
    </div>
  );
}

export function Materialy({ argumenty }: WidokProps) {
  const { kurs: k } = useKurs();
  const [rodzaj, arg] = argumenty;
  if (rodzaj === "lekcja" && arg) return <Lekcja nr={Number(arg)} />;
  if (rodzaj === "tekst" && arg) return <Tekst nr={Number(arg)} />;

  const teksty = tekstyDoCzytania(k);
  const inne = k.teksty.filter((t) => !teksty.includes(t));
  const lekcje = k.sesje.filter((s) => s.lekcja);
  const nastepna = k.nastepna_sesja;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Materiały</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink-2">Archiwum planów lekcji i teksty Lesestück do ponownego przeczytania.</p>
      </div>
      <NieJestPomiarem />

      <Karta>
        <Tytul podpis="Tylko teksty, które już dostałeś. Teksty z banku na kolejne sesje nie pojawiają się tutaj — każdy tekst idzie do Ciebie raz.">📖 Teksty Lesestück</Tytul>
        <ul className="divide-y divide-hairline">
          {[...teksty].reverse().map((t) => (
            <li key={t.tytul} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
              <span>
                <Link href={`#/materialy/tekst/${t.sesja}`} className="font-medium">
                  <span lang="de">{t.tytul}</span>
                </Link>
                <span className="text-sm text-muted"> · {t.gatunek}</span>
              </span>
              <span className="flex items-center gap-2 text-xs">
                <Plakietka ton={t.status === "wyslany" ? "akcent" : "neutral"}>{STATUS[t.status]}</Plakietka>
                <span className="text-muted">s{t.sesja}</span>
              </span>
            </li>
          ))}
        </ul>
        {inne.length > 0 && (
          <p className="mt-2 text-xs text-muted">
            Bez tekstu na stronie:{" "}
            {inne.map((t, i) => (
              <span key={t.tytul}>
                {i > 0 && " · "}
                <span lang="de">{t.tytul}</span> (s{t.sesja}, {STATUS[t.status]}
                {t.uwaga ? ` — ${t.uwaga}` : ""})
              </span>
            ))}
          </p>
        )}
      </Karta>

      <Karta>
        <Tytul podpis="Plany lekcji ze wszystkich przeprowadzonych sesji — dokładnie te pliki, z których prowadził Claude.">🗂️ Archiwum lekcji</Tytul>
        <ul className="divide-y divide-hairline">
          {nastepna.lekcja && (
            <li className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm">
              <span className="text-ink-2">
                🔒 Sesja {nastepna.nr} — <Md>{nastepna.temat}</Md>
              </span>
              <span className="text-xs text-muted">ukryta do lekcji</span>
            </li>
          )}
          {[...lekcje].reverse().map((s) => (
            <li key={s.nr} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm">
              <Link href={`#/materialy/lekcja/${s.nr}`}>
                Sesja {s.nr} — <Md>{s.temat}</Md>
              </Link>
              <span className="text-xs text-muted">{dataDluga(s.data)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">Sesje 1–4 odbyły się przed strukturą kursu i nie mają planów lekcji — ich zapis jest w drafts/.</p>
      </Karta>
    </div>
  );
}
