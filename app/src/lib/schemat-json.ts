import { z } from "zod";
import { KursJson } from "./schema.ts";

/** JSON Schema dla `data/kurs.json` — ten sam kształt co schemat zod, bez reguł z `superRefine`. */
export function schematJson() {
  return {
    ...z.toJSONSchema(KursJson, { target: "draft-2020-12" }),
    title: "kurs.json — stan kursu niemieckiego (dane dla pulpitu w app/)",
    description:
      "Generowany z app/src/lib/schema.ts (npm run schemat). Nie edytuj ręcznie. Walidacja: python3 data/sprawdz_dane.py",
  };
}
